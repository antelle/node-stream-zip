const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    js.configs.recommended,
    {
        files: ["node_stream_zip.js", "test/tests.js"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.node
        },
        rules: {
            "no-var": "error",
            "prefer-const": "error",
            curly: "error",
            eqeqeq: "error",
            "prefer-arrow-callback": "error",
            "no-new-object": "error",
            "object-shorthand": "error",
            "no-array-constructor": "error",
            "array-callback-return": "error",
            "no-eval": "error",
            "no-new-func": "error",
            "prefer-rest-params": "error",
            "prefer-spread": "error",
            "no-useless-constructor": "error",
            "no-dupe-class-members": "error",
            "no-duplicate-imports": "error",
            "no-unneeded-ternary": "error",
            "no-console": "error"
        }
    }
];
