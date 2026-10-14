import { describe, expect, it } from "vitest";
import { isAuthPage, isProtectedPath, safeNextPath } from "@/lib/auth/routes";

describe("safeNextPath (open-redirect protection)", () => {
  it("allows paths on our own site", () => {
    expect(safeNextPath("/onboarding")).toBe("/onboarding");
    expect(safeNextPath("/dashboard?tab=1")).toBe("/dashboard?tab=1");
  });

  it("rejects links to other sites", () => {
    for (const bad of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "",
      null,
      undefined,
      42,
    ]) {
      expect(safeNextPath(bad), String(bad)).toBe("/dashboard");
    }
  });
});

describe("route groups", () => {
  it("protects private sections and their sub-pages", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/onboarding")).toBe(true);
    expect(isProtectedPath("/onboarding/step")).toBe(true);
  });

  it("does not protect public pages or look-alike paths", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/sign-in")).toBe(false);
    expect(isProtectedPath("/dashboards-are-cool")).toBe(false);
  });

  it("recognises the sign-in and sign-up pages", () => {
    expect(isAuthPage("/sign-in")).toBe(true);
    expect(isAuthPage("/sign-up")).toBe(true);
    expect(isAuthPage("/dashboard")).toBe(false);
  });
});
