import { ApiErrorState } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { FeaturedManager } from "./manager";
import { apiGet } from "@/lib/api";
import type { Featured } from "@/lib/types";

// A6 · Featured content. The promotional screen — managed entirely by the
// admin, appears only on chosen days, and has no effect on score or streak.
export default async function FeaturedPage() {
  const result = await apiGet<{ featured: Featured[] }>("/api/admin/featured");

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Featured content" />
        <div className="p-8">
          <ApiErrorState error={result.error} status={result.status} />
        </div>
      </>
    );
  }

  return <FeaturedManager items={result.data.featured} />;
}
