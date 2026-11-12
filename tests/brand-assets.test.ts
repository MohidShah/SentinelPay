import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SentinelIcon, SentinelLogo } from "@/components/sentinel-logo";
import {
  fullLogoSvg,
  iconSvg,
  faviconSvg,
  generateAssets,
} from "../scripts/generate-brand-assets.mjs";

describe("Brand Assets Script (generate-brand-assets.mjs)", () => {
  it("exports valid SVG definitions with proper viewBoxes and unified favicon", () => {
    expect(iconSvg).toContain('viewBox="0 0 64 64"');
    // Unified favicon requirement: exact same icon as favicon
    expect(faviconSvg).toBe(iconSvg);
    expect(faviconSvg).toContain('viewBox="0 0 64 64"');
    expect(fullLogoSvg).toContain('viewBox="0 0 350 64"');
  });

  it("includes the updated official tagline in the horizontal logo SVG", () => {
    expect(fullLogoSvg).toContain("Trust Every Transaction. Control Every Agent.");
    expect(fullLogoSvg).toContain("Sentinel");
    expect(fullLogoSvg).toContain("Pay");
  });

  it("generateAssets() runs without error and generates files", () => {
    const assets = generateAssets();
    expect(assets.brandIcon).toBeDefined();
    expect(assets.logo).toBeDefined();
    expect(assets.appIcon).toBeDefined();
  });
});

describe("SentinelLogo and SentinelIcon Components", () => {
  it("renders SentinelIcon with default size and primary variant", () => {
    const html = renderToStaticMarkup(React.createElement(SentinelIcon));
    expect(html).toContain('width="36"');
    expect(html).toContain('height="36"');
    expect(html).toContain('viewBox="0 0 64 64"');
    expect(html).toContain("linearGradient");
  });

  it("renders SentinelIcon with custom size and slate variant", () => {
    const html = renderToStaticMarkup(
      React.createElement(SentinelIcon, { size: 48, variant: "slate" })
    );
    expect(html).toContain('width="48"');
    expect(html).toContain('height="48"');
    expect(html).toContain("#1E293B"); // Slate gradient start
  });

  it("renders SentinelIcon white variant", () => {
    const html = renderToStaticMarkup(
      React.createElement(SentinelIcon, { variant: "white" })
    );
    expect(html).toContain("#FFFFFF");
  });

  it("renders SentinelLogo with default tagline", () => {
    const html = renderToStaticMarkup(React.createElement(SentinelLogo));
    expect(html).toContain("Sentinel");
    expect(html).toContain("Pay");
    expect(html).toContain("Trust Every Transaction. Control Every Agent.");
  });

  it("allows custom tagline in SentinelLogo", () => {
    const html = renderToStaticMarkup(
      React.createElement(SentinelLogo, { tagline: "Custom Security Gateway" })
    );
    expect(html).toContain("Custom Security Gateway");
    expect(html).not.toContain("Trust Every Transaction. Control Every Agent.");
  });

  it("hides subtitle when showSubtitle is false", () => {
    const html = renderToStaticMarkup(
      React.createElement(SentinelLogo, { showSubtitle: false })
    );
    expect(html).toContain("Sentinel");
    expect(html).toContain("Pay");
    expect(html).not.toContain("Trust Every Transaction. Control Every Agent.");
  });
});

