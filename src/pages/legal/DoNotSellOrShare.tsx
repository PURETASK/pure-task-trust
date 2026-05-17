import { Link } from "react-router-dom";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { LEGAL_CONSTANTS } from "@/lib/legal-constants";

export default function DoNotSellOrShare() {
  return (
    <main className="min-h-screen bg-app-canvas">
      <SEO title="Do Not Sell or Share My Personal Information · PureTask" description="Submit a CCPA/CPRA opt-out of the sale or sharing of your personal information." url="/do-not-sell-or-share" />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-ink mb-4">Do Not Sell or Share My Personal Information</h1>
        <p className="text-ink-muted mb-6">
          Under the California Consumer Privacy Act (CCPA/CPRA) and similar state laws, you have the right to opt out of the sale or sharing of your personal information. {LEGAL_CONSTANTS.COMPANY_NAME} does not sell personal information for money, but certain advertising cookies may constitute "sharing" under CPRA.
        </p>
        <p className="text-ink-muted mb-6">
          We automatically honor the <strong>Global Privacy Control (GPC)</strong> browser signal. If you enable GPC, no further action is needed.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full"><Link to="/legal/privacy-requests">Submit opt-out request</Link></Button>
          <Button asChild variant="outline" className="rounded-full"><a href="https://globalprivacycontrol.org/" target="_blank" rel="noopener noreferrer">Learn about GPC</a></Button>
        </div>
      </article>
    </main>
  );
}