module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "mocha": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single",
            {"avoidEscape": true, "allowTemplateLiterals": true}
        ],
        "semi": [
            "error",
            "always"
        ],
        "comma-dangle": "off",
        "no-useless-escape": 0
    }
};
