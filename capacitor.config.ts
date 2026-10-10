import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // This can still be changed before the first App Store submission.
  appId: "us.expressly.app",
  appName: "Expressly",
  webDir: "dist",
  ios: {
    contentInset: "automatic",
  },
};

export default config;
