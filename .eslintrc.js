module.exports = {
    "root": true,
    "env": {
      "node": true
    },
    "extends": [
        "eslint:recommended"
    ],
    "rules": {
        // overwrite eslint:recommended
        "semi": ["error", "always"],
        "no-console": "off",
        // other eslint
        "indent": ["error", 4],
        "quotes": ["error", "single"],
        "space-before-blocks": "error",
        "keyword-spacing": ["error"],
        "comma-dangle": ["error", "never"]
    }
};
