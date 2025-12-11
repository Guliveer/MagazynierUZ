import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    ...tseslint.configs.recommended,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        // Custom ignores:
        "node_modules/**",
        "coverage/**",
        "lib/**",
        "src/components/ui/**",
        "scripts/**",
        // Config files
        "*.config.mjs",
        "*.config.js",
        "*.config.ts",
    ]),
    // Custom rules from eslint-config-connect
    {
        rules: {
            // Semicolons
            "semi": ["error", "always"],
            "semi-style": ["error", "last"],
            "no-extra-semi": "error",

            // Variables & Constants
            "no-const-assign": "error",
            "prefer-const": "error",
            "no-var": "warn",

            // Equality & Conditions
            "eqeqeq": "error",
            "no-constant-condition": "error",
            "use-isnan": "warn",

            // Functions
            "require-await": "error",
            "func-call-spacing": ["warn", "never"],

            // Spacing
            "space-before-blocks": ["warn", "always"],
            "no-multi-spaces": "warn",
            "block-spacing": "warn",
            "arrow-spacing": "warn",
            "computed-property-spacing": ["warn", "never"],
            "no-trailing-spaces": "warn",
            "indent": ["warn", 4, {SwitchCase: 1}],

            // Template literals
            "no-template-curly-in-string": "warn",
            "prefer-template": "warn",

            // Duplicates & Imports
            "no-dupe-args": "error",
            "no-dupe-keys": "error",
            "no-duplicate-imports": "error",
            "no-dupe-class-members": "error",

            // Control flow
            "no-fallthrough": "error",
            "no-unreachable": "error",
            "no-unsafe-optional-chaining": "error",
            "no-unused-expressions": "error",
            "curly": "error",
            "no-else-return": ["error", {allowElseIf: false}],
            "no-lonely-if": "error",

            // TypeScript specific
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-explicit-any": "warn",

            // Quotes & Commas
            "quotes": ["warn", "single", {avoidEscape: true}],
            "comma-dangle": ["error", "never"],
            "comma-spacing": ["warn", {before: false, after: true}],
            "comma-style": ["warn", "last"],

            // Empty lines
            "no-multiple-empty-lines": ["error", {max: 1, maxEOF: 0}],
        },
    },
]);

export default eslintConfig;
