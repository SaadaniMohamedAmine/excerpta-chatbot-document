// lib/export/pdf.ts
import PDFDocument from "pdfkit";
import type { ExportConversation } from "./types";

type PDFDoc = InstanceType<typeof PDFDocument>;

// Design-system colors, hex values copied directly from the locked palette.
// PDF export intentionally uses pdfkit's built-in standard fonts
// (Helvetica / Helvetica-Bold / Helvetica-Oblique) rather than embedding
// Geist/Source Serif as .ttf files. This keeps the generator dependency-free
// (no font files to ship, no embedding step, smaller function bundle) and
// standard PDF fonts render identically everywhere.
const COLORS = {
  ink: "#1E3A8A",
  gold: "#D4A537",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  border: "#E2E8F0",
};

export async function generateConversationPdf(
  conversation: ExportConversation
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        bufferPages: true, // lets us go back and stamp page numbers at the end
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // --- Title block ---
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor(COLORS.ink)
        .text(conversation.title, { align: "left" });

      doc
        .moveDown(0.3)
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.textSecondary)
        .text(
          `Exported from Excerpta — ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`
        );

      doc.moveDown(1);
      drawRule(doc);
      doc.moveDown(1);

      // --- Messages ---
      for (const message of conversation.messages) {
        ensureSpace(doc, 80);

        if (message.role === "user") {
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(COLORS.ink)
            .text("QUESTION", { characterSpacing: 0.5 });
          doc.moveDown(0.2);
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(COLORS.textPrimary)
            .text(message.content, { align: "left" });
        } else {
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(COLORS.textSecondary)
            .text("ANSWER", { characterSpacing: 0.5 });
          doc.moveDown(0.2);
          doc
            .font("Helvetica")
            .fontSize(11)
            .fillColor(COLORS.textPrimary)
            .text(message.content, { align: "left" });

          if (message.citations && message.citations.length > 0) {
            doc.moveDown(0.4);
            for (const citation of message.citations) {
              ensureSpace(doc, 30);
              const pageLabel = citation.pageNumber != null ? `p. ${citation.pageNumber}` : "source";
              const label = `Source: ${pageLabel} — "${truncate(citation.excerpt, 140)}"`;
              doc
                .font("Helvetica-Oblique")
                .fontSize(9)
                .fillColor(COLORS.gold)
                .text(label, { indent: 18, align: "left" });
            }
          }
        }

        doc.moveDown(1);
      }

      // --- Page numbers, stamped after content is laid out ---
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(COLORS.textSecondary)
          .text(`Page ${i + 1} of ${range.count}`, 72, doc.page.height - 50, {
            align: "center",
            width: doc.page.width - 144,
          });
      }

      doc.end();
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

function drawRule(doc: PDFDoc) {
  const y = doc.y;
  doc
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .stroke();
}

function ensureSpace(doc: PDFDoc, minHeight: number) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + minHeight > bottom) {
    doc.addPage();
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}
