import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file));
const text = async (file) => (await read(file)).toString("utf8");
const failures = [];

const requireMatch = (source, pattern, message) => {
  if (!pattern.test(source)) failures.push(message);
};

const pngDetails = async (file) => {
  const data = await read(file);
  const signature = data.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") throw new Error(`${file} is not a PNG.`);
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    colorType: data.readUInt8(25),
  };
};

const capacitor = await text("capacitor.config.ts");
requireMatch(capacitor, /appId:\s*["']us\.expressly\.app["']/, "Capacitor app ID must be us.expressly.app.");
requireMatch(capacitor, /appName:\s*["']Expressly["']/, "Capacitor app name must be Expressly.");

const project = await text("ios/App/App.xcodeproj/project.pbxproj");
requireMatch(project, /PRODUCT_BUNDLE_IDENTIFIER = us\.expressly\.app;/, "The Xcode bundle ID is incorrect.");
requireMatch(project, /MARKETING_VERSION = 1\.0;/, "The first App Store version must be 1.0.");
requireMatch(project, /CURRENT_PROJECT_VERSION = 1;/, "The first App Store build number must be 1.");
requireMatch(project, /TARGETED_DEVICE_FAMILY = "1,2";/, "The app must support both iPhone and iPad.");
requireMatch(project, /PrivacyInfo\.xcprivacy in Resources/, "The privacy manifest is not included in the app target.");

const info = await text("ios/App/App/Info.plist");
requireMatch(info, /<key>CFBundleDisplayName<\/key>\s*<string>Expressly<\/string>/, "The iOS display name is incorrect.");
requireMatch(info, /<key>UILaunchStoryboardName<\/key>/, "The iOS launch screen is not configured.");

const privacy = await text("ios/App/App/PrivacyInfo.xcprivacy");
requireMatch(privacy, /<key>NSPrivacyTracking<\/key>\s*<false\/>/, "The privacy manifest must state that Expressly does not track users.");
for (const dataType of ["EmailAddress", "UserID", "ProductInteraction", "OtherUserContent"]) {
  requireMatch(privacy, new RegExp(`NSPrivacyCollectedDataType${dataType}`), `The privacy manifest is missing ${dataType}.`);
}

const icon = await pngDetails("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png");
if (icon.width !== 1024 || icon.height !== 1024) failures.push("The App Store icon must be 1024 by 1024 pixels.");
if (![0, 2, 3].includes(icon.colorType)) failures.push("The App Store icon must not contain an alpha channel.");

const listing = await text("docs/APP_STORE_LISTING_DRAFT.md");
for (const url of ["https://www.expressly.us/", "https://www.expressly.us/support", "https://www.expressly.us/privacy", "https://www.expressly.us/terms"]) {
  if (!listing.includes(url)) failures.push(`The App Store listing is missing ${url}.`);
}

if (failures.length > 0) {
  console.error("Expressly is not ready for App Store packaging:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("App Store package audit passed: identity, version, device support, icon, launch screen, privacy manifest, and listing URLs are present.");
