import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">P</span>
              </div>
              <span className="font-semibold text-lg">PureTask</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Trust-first cleaning marketplace. Pay only when you're happy.
            </p>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">For Clients</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/discover" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Find Cleaners
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Book Cleaning
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Cleaners */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">For Cleaners</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Become a Cleaner
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cleaner FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Legal Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PureTask. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with trust in mind.
          </p>
        </div>
      </div>
    </footer>
  );
}
