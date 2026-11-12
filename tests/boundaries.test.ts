import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Security principle 1: the agent never touches payment code or credentials. */

const root = path.resolve(__dirname, "..");

function filesIn(dir: string): string[] {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((d) => {
    const rel = path.join(dir, d.name);
    return d.isDirectory() ? filesIn(rel) : /\.tsx?$/.test(d.name) ? [rel] : [];
  });
}

const importsOf = (file: string) =>
  [...fs.readFileSync(path.join(root, file), "utf8").matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);

describe("trust boundaries", () => {
  it("lib/agent never imports PayPal, the pipeline, or env secrets", () => {
    for (const file of filesIn("lib/agent")) {
      for (const imp of importsOf(file)) {
        expect(imp, `${file} imports ${imp}`).not.toMatch(/paypal|pipeline|@\/lib\/env$/i);
      }
    }
  });

  it("only the pipeline imports the PayPal executor", () => {
    const importers = [...filesIn("lib"), ...filesIn("app")].filter((f) =>
      importsOf(f).some((i) => i.includes("lib/paypal")),
    );
    expect(importers.map((f) => f.replace(/\\/g, "/"))).toEqual(["lib/pipeline/run.ts"]);
  });
});
