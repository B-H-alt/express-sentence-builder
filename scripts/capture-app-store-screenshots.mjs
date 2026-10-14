import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const host = "127.0.0.1";
const port = 8091;
const baseURL = `http://${host}:${port}`;
const outputRoot = path.resolve("artifacts/app-store-screenshots");

const devices = [
  {
    name: "iphone-6.9",
    viewport: { width: 440, height: 956 },
    deviceScaleFactor: 3,
  },
  {
    name: "ipad-13",
    viewport: { width: 1032, height: 1376 },
    deviceScaleFactor: 2,
  },
];

const learnerState = {
  state: {
    onboardingComplete: true,
    userName: "Alex",
    userImage: null,
    characterGender: "girl",
    currentLevel: 1,
    showWords: true,
    language: "en",
    lowStimulationMode: false,
    favorites: ["l1-1", "l1-11", "l1-13", "l1-22"],
    recentCardIds: ["l1-23", "l1-14", "l1-15", "l1-16"],
  },
  version: 15,
};

const waitForServer = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {
      // The local server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${baseURL}`);
};

const screenshot = async (page, directory, name) => {
  await page.screenshot({
    path: path.join(directory, `${name}.png`),
    fullPage: false,
  });
};

const captureDevice = async (browser, device) => {
  const directory = path.join(outputRoot, device.name);
  await mkdir(directory, { recursive: true });

  const context = await browser.newContext({
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    hasTouch: true,
    isMobile: device.name.startsWith("iphone"),
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  await page.addInitScript((state) => {
    window.localStorage.setItem("expressly-guide-seen", "true");
    window.localStorage.setItem("pecs-storage", JSON.stringify(state));
  }, learnerState);
  await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
  await page.goto(`${baseURL}/pecs-app`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Expressly" }).waitFor();

  await screenshot(page, directory, "01-communication-home");

  await page.getByRole("button", { name: "People" }).click();
  await page.getByRole("button", { name: "Add Mom to sentence" }).click();
  await screenshot(page, directory, "02-build-a-message");

  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("button", { name: "Add Eat to sentence" }).click();
  await screenshot(page, directory, "03-complete-a-message");

  await page.getByRole("button", { name: "Open Alex's learner profile" }).click();
  await page.getByRole("menuitem", { name: "Profile & settings" }).click();
  await page.getByRole("heading", { name: "Settings" }).waitFor();
  await screenshot(page, directory, "04-personalize-expressly");

  await context.close();
};

const server = spawn("npm", ["run", "dev", "--", "--host", host, "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  for (const device of devices) {
    await captureDevice(browser, device);
  }
  console.log(`App Store screenshots saved to ${outputRoot}`);
} catch (error) {
  if (serverOutput) console.error(serverOutput);
  throw error;
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
