import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// TODO W4-7.5: eslint-plugin-jsx-a11y (735KB) and eslint-plugin-security (145KB)
// are NOT installed. Both exceed the 50KB new-dependency budget (AGENTS.md #45).
// Next.js core-web-vitals already enforces a baseline of a11y rules
// (eslint-plugin-react eslint-plugin-jsx-a11y subset via next/core-web-vitals).
// Revisit if stricter a11y linting is required.

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
  ]),
  {
    // Server component pages must use @/lib/sanity.server, not the browser-only @/lib/sanity.
    files: ["src/app/**/page.tsx", "src/app/**/page.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/sanity"],
              message:
                "Use @/lib/sanity.server in server components. @/lib/sanity is browser-only.",
              allowTypeImports: false,
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
