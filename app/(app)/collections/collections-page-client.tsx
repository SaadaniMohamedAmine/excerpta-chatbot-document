// app/(app)/collections/collections-page-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, FolderStar } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageHeaderBanner } from "@/components/ui/page-header-banner";
import CollectionCard, { type CollectionSummary } from "@/components/dashboard/CollectionCard";
import NewCollectionModal from "@/components/dashboard/NewCollectionModal";
import { CollectionCreatedModal } from "@/components/dashboard/CollectionCreatedModal";

interface CollectionsPageClientProps {
  collections: CollectionSummary[];
}

export default function CollectionsPageClient({ collections }: CollectionsPageClientProps) {
  const t = useTranslations("Collections");
  const tNav = useTranslations("Nav");
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [createdCollection, setCreatedCollection] = useState<{ name: string } | null>(null);

  const handleCreated = (_collectionId: string, name: string) => {
    setModalOpen(false);
    // Landing on the new (empty) collection's chat workspace has nothing to
    // ask a question about yet — point at Documents instead, where the
    // documents that would actually make it useful can be added to it.
    setCreatedCollection({ name });
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeaderBanner
        icon={FolderStar}
        title={tNav("collections")}
        subtitle={t("subtitle")}
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" weight="bold" />
            {t("newCollection")}
          </Button>
        }
      />

      <div className="mt-6">
        {collections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface px-8 py-16 text-center">
            <p className="font-sans text-sm text-text-secondary">{t("emptyState")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collections.map((c) => (
              <CollectionCard key={c.id} collection={c} />
            ))}
          </div>
        )}
      </div>

      {modalOpen && <NewCollectionModal onClose={() => setModalOpen(false)} onCreated={handleCreated} />}

      {createdCollection && (
        <CollectionCreatedModal
          open
          collectionName={createdCollection.name}
          onClose={() => setCreatedCollection(null)}
        />
      )}
    </div>
  );
}
