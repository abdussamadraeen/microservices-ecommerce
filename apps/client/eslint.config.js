const nextJsConfig = [
  {
    ignores: ["dist/**", ".next/**", "node_modules/**"],
  },
  {
    rules: {
      // Allow inline styles for dynamic values (like color swatches)
      "react/forbid-dom-props": "off",
      "@next/next/no-css-tags": "off",
    },
  },
];

/** @type {import("eslint").Linter.Config} */
export default nextJsConfig;
