import globals from "globals";
import pluginJs from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ["node_modules/**"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
];
