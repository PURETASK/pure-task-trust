import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.2c7cb9acb84e45d3808107c5cb818b12",
  appName: "pure-task-trust",
  webDir: "dist",
  server: {
    url: "https://2c7cb9ac-b84e-45d3-8081-07c5cb818b12.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  ios: {
    contentInset: "always",
    scrollEnabled: true,
  },
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: true,
  },
};

export default config;
