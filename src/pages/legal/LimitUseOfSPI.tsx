import { Link } from "react-router-dom";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { LEGAL_CONSTANTS } from "@/lib/legal-constants";

export default function LimitUseOfSPI() {
  return (
    <main className="min-h-screen bg-app-canvas">
      <SEO title="Limit the Use of My Sensitive Personal Information · PureTask" description="Submit a CPRA request to limit the use of your sensitive personal information." url="/limit-use-of-spi" />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-ink mb-4">Limit the Use of My Sensitive Personal Information</h1>
        <p className="text-ink-muted mb-6">
          Under the California Privacy Rights Act (CPRA), you have the right to direct {LEGAL_CONSTANTS.COMPANY_NAME} to limit the use of your sensitive personal information (such as precise geolocation, government IDs, and financial account details) to only what is necessary to provide the services you requested.
        </p>
        <p className="text-ink-muted mb-6">
          We do not use sensitive personal information for purposes beyond providing the platform. To formally exercise this right, submit a request below.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full"><Link to="/legal/privacy-requests">Submit limit-use request</Link></Button>
        </div>
      </article>
    </main>
  );
}