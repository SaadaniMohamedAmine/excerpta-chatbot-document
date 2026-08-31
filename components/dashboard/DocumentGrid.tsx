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
    <div className="flex flex-wrap gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="w-full sm:w-[260px]">
          <DocumentCard document={doc} highlightForTour={doc.title === DEMO_DOCUMENT_TITLE} />
        </div>
      ))}
    </div>
  );
}
