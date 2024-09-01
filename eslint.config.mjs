import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin"; // Ensure this is correctly imported
import { defineConfig } from 'eslint';

export default defineConfig({
  overrides: [
    {
      files: ["**/*.{js,mjs,cjs,ts}"],
    },
    {
      files: ["**/*.js"],
      languageOptions: { sourceType: "commonjs" },
    },
    {
      languageOptions: { globals: globals.browser },
    },
    {
      // Apply JavaScript ESLint rules
      ...pluginJs.configs.recommended,
    },
    {
      // Apply TypeScript ESLint rules and disable the specific rule
      ...tseslint.configs.recommended,
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
});
