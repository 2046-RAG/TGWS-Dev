import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Node.js utility scripts (use require() style)
    "scripts/**",
    // Playwright-generated HTML report assets (third-party JS, not project code)
    "tests/functional/functional-report/**",
    "coverage/**",
    // One-off local migration scripts (require() style, not project code)
    "_*.cjs",
  ]),
]);

export default eslintConfig;
