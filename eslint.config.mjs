import globals from "globals";
import pluginJs from "@eslint/js";
import pluginWc from "eslint-plugin-wc";
import pluginLit from "eslint-plugin-lit";


export default [
  {languageOptions: {
    globals: {
      app: 'readonly',
      ...globals.browser
    }
  }},
  pluginLit.configs["flat/recommended"],
  pluginWc.configs["flat/recommended"],
  pluginJs.configs.recommended,
];
