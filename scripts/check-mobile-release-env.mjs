import { loadEnv } from "vite";

const env = loadEnv("production", process.cwd(), "");

const requiredPublicValues = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_TURNSTILE_SITE_KEY",
  "VITE_PUBLIC_APP_ORIGIN",
];

const missing = requiredPublicValues.filter((name) => !env[name]?.trim());
const problems = [];

if (missing.length > 0) {
  problems.push(`Missing production values: ${missing.join(", ")}`);
}

for (const name of ["VITE_SUPABASE_URL", "VITE_PUBLIC_APP_ORIGIN"]) {
  const value = env[name]?.trim();
  if (value && !value.startsWith("https://")) {
    problems.push(`${name} must use HTTPS.`);
  }
}

const unsafeClientVariables = Object.keys(env).filter((name) =>
  name.startsWith("VITE_") &&
  /(SERVICE_ROLE|PRIVATE|SECRET|API_TOKEN|GENERATIVE_AI|ELEVENLABS_API)/i.test(name),
);

if (unsafeClientVariables.length > 0) {
  problems.push(`Server secrets must not use a VITE_ prefix: ${unsafeClientVariables.join(", ")}`);
}

if (problems.length > 0) {
  console.error("Expressly is not ready for a production iOS build:");
  for (const problem of problems) console.error(`- ${problem}`);
  console.error("Add browser-safe production values locally or through the protected build environment. Never paste server secrets into VITE_ variables.");
  process.exit(1);
}

console.log("Mobile release configuration is present and uses safe public variable names.");
