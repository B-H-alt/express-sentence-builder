import { expect, test, type Page } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, openSettings, expectNoHorizontalOverflow } from "./helpers";

const userId = "11111111-1111-4111-8111-111111111111";
const deviceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const device = { id: deviceId, name: "Test iPad", settings: { calm: false, volume: 0.8, level: 2 }, revision: 0, paired: true, updated_at: new Date().toISOString() };
const signIn = async (page: Page) => {
  await seedLearner(page); await blockThirdPartyWidgets(page);
  const user = { id: userId, aud: "authenticated", role: "authenticated", email: "test@example.com", email_confirmed_at: new Date().toISOString(), app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
  const encode = (v: unknown) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const token = `${encode({alg:"HS256",typ:"JWT"})}.${encode({sub:userId,exp:Math.floor(Date.now()/1000)+3600})}.test-signature`;
  await page.route("**/auth/v1/**", route => route.fulfill({ json: route.request().url().includes("/token") ? { access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, user } : { user, ...user } }));
  await page.goto("/pecs-app?account=sign-in");
  await page.getByPlaceholder("parent@example.com").fill("test@example.com");
  await page.getByPlaceholder("Password", {exact:true}).fill("Test-password-123!");
  await page.getByRole("dialog").getByRole("button", {name:"Sign in",exact:true}).click();
  await expect(page.getByRole("searchbox", {name:"Find a card"})).toBeVisible();
};
const openDevices = async (page: Page) => {
  await openSettings(page); await page.getByRole("button", {name:"Close settings",exact:true}).click();
  await page.getByRole("button", {name:"Connected devices",exact:true}).click();
};

test("pairing sends only a code hash and remote changes need an explicit save", async ({page}) => {
  let pairHash = "";
  let settings: unknown;
  await page.route("**/rest/v1/rpc/caregiver_device_action", route => {
    const {p_action,p_data}=route.request().postDataJSON();
    if(p_action==="pair") pairHash=p_data.code_hash;
    if(p_action==="update") settings=p_data.settings;
    return route.fulfill({json:p_action==="list" ? [device] : {...device,revision:p_action==="update"?1:0}});
  });
  await signIn(page); await openDevices(page);
  await page.getByLabel("Pairing code", {exact:true}).fill("1234-5678-90ab-cdef-1234-5678-90ab-cdef");
  await page.getByRole("button", {name:"Connect device",exact:true}).click();
  await expect(page.getByRole("status").filter({hasText:"Device connected"})).toBeVisible();
  expect(pairHash).toMatch(/^[a-f0-9]{64}$/);
  await page.getByLabel("Calm mode", {exact:true}).check();
  expect(settings).toBeUndefined();
  await page.getByRole("button", {name:"Save settings",exact:true}).click();
  await expect(page.getByRole("status").filter({hasText:"Delivery is not yet confirmed"})).toBeVisible();
  expect(settings).toMatchObject({calm:true,volume:0.8,level:2});
  await expectNoHorizontalOverflow(page);
});

test("remote receiver waits for sentence clearance and never cancels speech", async ({page}) => {
  let polls=0;
  await page.route("**/rest/v1/rpc/caregiver_device_action", route => { polls++; return route.fulfill({json:{...device,revision:1,settings:{calm:true,volume:0.5,level:4}}}); });
  await signIn(page);
  await page.getByRole("searchbox",{name:"Find a card"}).fill("dad");
  await page.getByRole("button",{name:"Add Dad to sentence",exact:true}).click();
  await page.evaluate(async ({userId,deviceId}) => {
    const {saveLocalDevice}=await import("/src/lib/caregiverDevices.ts");
    (window as unknown as {testCancel:number}).testCancel=0;
    window.speechSynthesis.cancel=()=>{ (window as unknown as {testCancel:number}).testCancel++; };
    saveLocalDevice({id:deviceId,owner:userId,revision:0});
  },{userId,deviceId});
  await expect.poll(()=>polls).toBeGreaterThan(0);
  await expect(page.getByRole("button",{name:"Remove Dad from sentence",exact:true})).toBeVisible();
  expect(await page.evaluate(async()=> (await import("/src/store/cardStore.ts")).useCardStore.getState().currentLevel)).toBe(1);
  await page.evaluate(async()=>{
    (await import("/src/store/cardStore.ts")).useCardStore.setState({sentence:[]});
    window.dispatchEvent(new Event("online"));
  });
  await expect(page.getByText("Level 4 (Explore)",{exact:true})).toBeVisible();
  expect(await page.evaluate(()=> (window as unknown as {testCancel:number}).testCancel)).toBe(0);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("expressly-linked-device-v1")!).revision)).toBe(1);
});

test("missing server setup is explained without pretending linking succeeded", async ({page}) => {
  await page.route("**/rest/v1/rpc/caregiver_device_action", route=>route.fulfill({status:404,json:{code:"PGRST202",message:"Missing function"}}));
  await signIn(page); await openDevices(page);
  await expect(page.getByRole("status").filter({hasText:"Device linking is not enabled on the server yet."})).toBeVisible();
});

test("remote settings reject extra fields and never rewrite a sentence", async ({page}) => {
  await seedLearner(page); await page.goto("/pecs-app");
  const result=await page.evaluate(async()=>{
    const {applyRemoteSettings}=await import("/src/lib/caregiverDevices.ts");
    const {useCardStore}=await import("/src/store/cardStore.ts");
    let rejected=false;
    try { applyRemoteSettings({calm:true,volume:0.5,level:4,sentence:[]}); } catch { rejected=true; }
    const before=useCardStore.getState(); const sentence=before.sentence;
    const applied=applyRemoteSettings({calm:true,volume:0.5,level:4});
    return {rejected,applied,sameSentence:useCardStore.getState().sentence===sentence,name:useCardStore.getState().userName};
  });
  expect(result).toEqual({rejected:true,applied:true,sameSentence:true,name:"Test Learner"});
});

test("communication device creates a random code and unlinking requires confirmation", async ({page}) => {
  let hash=""; let revokes=0;
  await page.route("**/rest/v1/rpc/caregiver_device_action",route=>{
    const {p_action,p_data}=route.request().postDataJSON();
    if(p_action==="register") hash=p_data.code_hash;
    if(p_action==="revoke") revokes++;
    return route.fulfill({json:p_action==="list"?[]:{...device,paired:false}});
  });
  await signIn(page); await openDevices(page);
  await page.getByRole("button",{name:"Create pairing code",exact:true}).click();
  await expect(page.getByRole("button",{name:"Copy code",exact:true})).toBeVisible();
  const code=await page.locator("p.font-mono").innerText();
  expect(code).toMatch(/^(?:[a-f0-9]{4}-){7}[a-f0-9]{4}$/);
  expect(hash).toBe(await page.evaluate(async code => (await import("/src/lib/caregiverDevices.ts")).hashPairingCode(code),code));
  await page.getByRole("button",{name:"Unlink this device",exact:true}).click();
  expect(revokes).toBe(0);
  await page.getByRole("button",{name:"Confirm unlink this device",exact:true}).click();
  await expect(page.getByRole("button",{name:"Create pairing code",exact:true})).toBeVisible();
  expect(revokes).toBe(1);
});
