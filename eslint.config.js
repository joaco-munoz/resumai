import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Deno Edge Functions run in a different runtime with their own tooling
    // (Deno lint); the browser ESLint config produces false positives on them.
    ignores: ["dist", "node_modules", "supabase/functions/**"],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // `any` is surfaced as a warning during the open-source migration rather
      // than a hard error (much of it is generated types / shadcn boilerplate).
      // New code should prefer precise types — see CONTRIBUTING.md.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Config files may use Node globals.
    files: ["*.config.{js,ts}", "vite.config.ts", "tailwind.config.ts"],
    languageOptions: { globals: globals.node },
  },
);
