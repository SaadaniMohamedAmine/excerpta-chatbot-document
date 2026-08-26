// app/(app)/collections/collections-page-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import CollectionCard, { type CollectionSummary } from "@/components/dashboard/CollectionCard";
import NewCollectionModal, { type SelectableDocument } from "@/components/dashboard/NewCollectionModal";

interface CollectionsPageClientProps {
  collections: CollectionSummary[];
  availableDocuments: SelectableDocument[];
}

export default function CollectionsPageClient({ collections, availableDocuments }: CollectionsPageClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreated = (collectionId: string) => {
    setModalOpen(false);
    router.push(`/collections/${collectionId}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-xl font-semibold text-text-primary">Collections</h1>
          <p className="mt-1 font-sans text-sm text-text-secondary">
            Group related documents to ask questions across all of them at once.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" weight="bold" />
          New collection
        </Button>
      </div>

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

      {modalOpen && (
        <NewCollectionModal availableDocuments={availableDocuments} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
