import { getAidRequests } from "@/app/actions/aid-requests";
import { RequestsTable } from "@/components/requests-table";
import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const requests = await getAidRequests();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-primary" />
            Aid Requests
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage all disaster relief requests across Mumbai
          </p>
        </div>
        <Link href="/requests/new">
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      <RequestsTable initialRequests={JSON.parse(JSON.stringify(requests))} />
    </div>
  );
}
