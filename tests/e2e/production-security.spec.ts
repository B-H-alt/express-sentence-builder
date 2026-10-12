import { expect, test } from "@playwright/test";

const productionOrigin = "https://www.expressly.us";

test("paid service endpoints reject signed-out requests", async ({ request }) => {
  const cases = [
    { path: "/api/compose", body: { tokens: ["I", "want", "water"], tense: "present", language: "en" } },
    { path: "/api/speak", body: { text: "I want water." } },
    { path: "/api/replicate/generate", body: { prompt: "water" } },
    { path: "/api/account/delete", body: { confirmation: "DELETE" } },
  ];

  for (const item of cases) {
    const response = await request.post(`${productionOrigin}${item.path}`, { data: item.body });
    expect(response.status(), item.path).toBe(401);
    expect(response.headers()["cache-control"], item.path).toContain("no-store");
  }
});

test("production sends essential browser security headers", async ({ request }) => {
  const response = await request.get(`${productionOrigin}/`);
  const headers = response.headers();

  expect(response.ok()).toBeTruthy();
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});
