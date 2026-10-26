import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["data/**"],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
