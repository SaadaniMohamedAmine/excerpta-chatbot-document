// components/dashboard/DocumentGrid.tsx
import DocumentCard from "./DocumentCard";

export interface DashboardDocument {
  id: string;
  title: string;
  fileType: "pdf" | "docx" | "csv" | "code";
  fileSize: number;
  status: "processing" | "ready" | "failed";
  createdAt: string;
  conversationCount: number;
}

const DEMO_DOCUMENT_TITLE = "Getting Started with Excerpta.pdf";

export default function DocumentGrid({ documents }: { documents: DashboardDocument[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} highlightForTour={doc.title === DEMO_DOCUMENT_TITLE} />
      ))}
    </div>
  );
}
