module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/recommended"],
  parserOptions: {
    parser: "babel-eslint",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/singleline-html-element-content-newline": ["warn", {
      "ignoreWhenNoAttributes": true,
      "ignoreWhenEmpty": true,
      "ignores": ["pre", "textarea"]
    }],
    "vue/max-attributes-per-line": ["error", {
      "singleline": 1,
      "multiline": {
        "max": 1,
        "allowFirstLine": true
      }
    }]
  },
};
