// app/(app)/collections/collections-page-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderStar } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageHeaderBanner } from "@/components/ui/page-header-banner";
import CollectionCard, { type CollectionSummary } from "@/components/dashboard/CollectionCard";
import NewCollectionModal from "@/components/dashboard/NewCollectionModal";

interface CollectionsPageClientProps {
  collections: CollectionSummary[];
}

export default function CollectionsPageClient({ collections }: CollectionsPageClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreated = (collectionId: string) => {
    setModalOpen(false);
    router.push(`/collections/${collectionId}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeaderBanner
        icon={FolderStar}
        title="Collections"
        subtitle="Group related documents to ask questions across all of them at once."
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" weight="bold" />
            New collection
          </Button>
        }
      />

      <div className="mt-6">
        {collections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface px-8 py-16 text-center">
            <p className="font-sans text-sm text-text-secondary">
              No collections yet. Group documents together to ask questions across all of them.
            </p>
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
    </div>
  );
}
