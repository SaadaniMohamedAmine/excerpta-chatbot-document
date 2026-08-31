// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/db";

// The Stripe SDK isn't guaranteed edge-compatible.
export const runtime = "nodejs";

function planFromPriceId(priceId: string | undefined): "pro" | "team" | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ID_TEAM) return "team";
  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Signature verification needs the raw body — request.json() would parse
  // it first and silently break verification.
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhooks/stripe] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const userId = checkoutSession.metadata?.userId;
        const subscriptionId =
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : checkoutSession.subscription?.id;
        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const plan = planFromPriceId(subscription.items.data[0]?.price.id);
          if (plan) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                plan,
                stripeSubscriptionId: subscriptionId,
                stripeSubscriptionStatus: subscription.status,
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const plan = planFromPriceId(subscription.items.data[0]?.price.id);
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        });
        if (user && plan) {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan, stripeSubscriptionStatus: subscription.status },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan: "free", stripeSubscriptionId: null, stripeSubscriptionStatus: "canceled" },
          });
        }
        break;
      }

      default:
        break; // ignore anything we didn't subscribe to in the webhook config
    }
  } catch (error) {
    // Stripe retries on non-2xx — log but still ack to avoid infinite retries
    // for a bug on our side that a retry wouldn't fix anyway.
    console.error(`[webhooks/stripe] handler failed for ${event.type}:`, error);
  }

  return NextResponse.json({ received: true });
}
