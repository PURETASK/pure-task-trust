import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useMFA } from "@/hooks/useMFA";
import { Shield, Smartphone, Mail, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function MFASetup() {
  const {
    settings, isLoading, setupTOTP, setupEmailMFA, disableMFA,
    totpSecret, totpUri, recoveryCodes,
  } = useMFA();
  const [showRecovery, setShowRecovery] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading security settings…</CardContent>
      </Card>
    );
  }

  const isTotpActive = settings.method === "totp" || settings.method === "both";
  const isEmailActive = settings.method === "email" || settings.method === "both";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center" aria-hidden="true">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </div>
            </div>
            {settings.is_enabled && (
              <Badge className="bg-success/15 text-success border-success/30">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TOTP Option */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="font-medium text-sm">Authenticator App (TOTP)</p>
                <p className="text-xs text-muted-foreground">Google Authenticator, Authy, etc.</p>
              </div>
            </div>
            {isTotpActive ? (
              <Badge className="bg-success/15 text-success border-success/30">Enabled</Badge>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setupTOTP.mutate()}
                disabled={setupTOTP.isPending}
                aria-label="Set up authenticator app"
              >
                Set Up
              </Button>
            )}
          </div>

          {/* Email Option */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="font-medium text-sm">Email Verification</p>
                <p className="text-xs text-muted-foreground">Receive a code via email on login</p>
              </div>
            </div>
            <Switch
              checked={isEmailActive}
              onCheckedChange={(checked) => {
                if (checked) setupEmailMFA.mutate();
                else if (settings.method === "both") setupTOTP.mutate(); // revert to totp-only
                else disableMFA.mutate();
              }}
              aria-label="Toggle email 2FA"
            />
          </div>

          {/* Disable all */}
          {settings.is_enabled && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => disableMFA.mutate()}
              disabled={disableMFA.isPending}
            >
              <AlertTriangle className="h-4 w-4 mr-1" aria-hidden="true" />
              Disable All 2FA
            </Button>
          )}
        </CardContent>
      </Card>

      {/* TOTP Setup Card */}
      {totpSecret && totpUri && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" aria-hidden="true" />
              Set Up Authenticator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">
                Add this key to your authenticator app manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background px-3 py-2 rounded-lg border flex-1 break-all font-mono" aria-label="TOTP secret key">
                  {totpSecret}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(totpSecret);
                    toast.success("Secret copied");
                  }}
                  aria-label="Copy secret key"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRecovery(!showRecovery)}
            >
              {showRecovery ? "Hide" : "Show"} Recovery Codes
            </Button>

            {showRecovery && recoveryCodes.length > 0 && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                  <p className="text-sm font-semibold">Save these recovery codes</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Store these somewhere safe. Each code can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-2" role="list" aria-label="Recovery codes">
                  {recoveryCodes.map((code, i) => (
                    <code key={i} className="text-xs bg-background px-3 py-2 rounded border text-center font-mono" role="listitem">
                      {code}
                    </code>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(recoveryCodes.join("\n"));
                    toast.success("Recovery codes copied");
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" aria-hidden="true" /> Copy All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
