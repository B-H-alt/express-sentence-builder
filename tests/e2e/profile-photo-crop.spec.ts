import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, expectNoHorizontalOverflow } from "./helpers";

test("profile photo crop supports zoom, positioning, cancel and explicit profile saving", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  await page.getByRole("button", { name: "Open Test Learner's learner profile", exact: true }).click();
  await page.getByRole("menuitem", { name: "Profile & settings", exact: true }).click();
  // Deliberately non-square test photo with identifiable left/center/right regions.
  const photo = await page.evaluate(() => {
    const canvas = document.createElement("canvas"); canvas.width = 900; canvas.height = 300;
    const context = canvas.getContext("2d")!;
    for (const [index, color] of ["red", "green", "blue"].entries()) {
      context.fillStyle = color; context.fillRect(index * 300, 0, 300, 300);
    }
    return canvas.toDataURL("image/png").split(",")[1];
  });
  const upload = () => page.locator('input[type="file"]').setInputFiles({ name: "crop-test.png", mimeType: "image/png", buffer: Buffer.from(photo, "base64") });
  await upload();
  await expect(page.getByRole("heading", { name: "Adjust your photo", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save profile", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Close settings", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Adjust your photo", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cancel crop", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Adjust your photo", exact: true })).toHaveCount(0);
  await upload(); // The same file can be selected again after cancelling.
  await page.getByRole("button", { name: "Use photo", exact: true }).waitFor();
  const position = page.getByRole("group", { name: "Photo position", exact: true });
  await expectNoHorizontalOverflow(page);
  // Exercise pointer dragging as well as keyboard positioning.
  await position.scrollIntoViewIfNeeded();
  const box = (await position.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2); await page.mouse.up();
  await page.getByRole("button", { name: "Reset position", exact: true }).click();
  const zoom = page.getByRole("slider", { name: "Photo zoom", exact: true });
  await zoom.focus(); await zoom.press("End");
  await expect(zoom).toHaveValue("3");
  await position.focus();
  for (let i = 0; i < 6; i++) await position.press("Shift+ArrowLeft");
  await page.getByRole("button", { name: "Use photo", exact: true }).click();
  const cropped = await page.locator('img[alt="Profile"]').getAttribute("src");
  const pixels = await page.evaluate(async (source) => {
    const image = new Image(); image.src = source!; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d")!; context.drawImage(image, 0, 0);
    return { width: image.naturalWidth, height: image.naturalHeight, center: Array.from(context.getImageData(256, 256, 1, 1).data) };
  }, cropped);
  expect(pixels.width).toBe(512); expect(pixels.height).toBe(512);
  expect(pixels.center[2]).toBeGreaterThan(240); // Right side was selected, not center.
  expect(pixels.center[0]).toBeLessThan(15);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("pecs-storage")!).state.userImage)).toBeNull();
  await page.getByRole("button", { name: "Adjust crop", exact: true }).click();
  await page.getByRole("button", { name: "Cancel crop", exact: true }).click();
  await expect(page.locator('img[alt="Profile"]')).toHaveAttribute("src", cropped!);
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("pecs-storage")!).state.userImage)).toBe(cropped);
});
