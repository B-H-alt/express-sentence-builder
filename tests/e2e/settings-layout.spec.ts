import { expect, test } from "@playwright/test";
import { seedLearner, openSettings, blockThirdPartyWidgets, expectNoHorizontalOverflow } from "./helpers";

test("settings navigation supports keyboard and keeps the active section visible", async ({page}) => {
  await seedLearner(page); await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app"); await openSettings(page);
  const mobile=(page.viewportSize()?.width??1280)<768;
  await expect(page.getByRole("tablist",{name:"Settings sections"})).toHaveAttribute("aria-orientation",mobile?"horizontal":"vertical");
  await page.getByRole("tab",{name:"Profile",exact:true}).focus();
  await page.keyboard.press(mobile?"ArrowRight":"ArrowDown");
  await expect(page.getByRole("tab",{name:"Vocabulary",exact:true})).toHaveAttribute("aria-selected","true");
  await expect(page.getByRole("tabpanel",{name:"Vocabulary",exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:"Save level",exact:true})).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab",{name:"Accessibility",exact:true})).toBeFocused();
  await expect(page.getByRole("tabpanel",{name:"Accessibility",exact:true})).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab",{name:"Profile",exact:true})).toBeFocused();
  await page.setViewportSize({width:390,height:500});
  await expect(page.getByRole("button",{name:"Save profile",exact:true})).toBeInViewport();
  await expect(page.getByRole("button",{name:"Close settings",exact:true})).toBeInViewport();
});
