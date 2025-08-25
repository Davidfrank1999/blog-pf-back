import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.node,   // ✅ Node.js globals (process, require, etc.)
        ...globals.es2021, // ✅ modern JS globals
      },
    },
  },
]);
