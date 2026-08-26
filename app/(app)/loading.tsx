import { BarLoader } from "@/components/ui/bar-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BarLoader />
    </div>
  );
}
