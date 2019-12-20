/**
 * This starter project recommended using Microsoft TSLint rules.
 * Please see https://github.com/Microsoft/tslint-microsoft-contrib for more details.
 */

module.exports = {
  "extends": [
    "tslint-microsoft-contrib/recommended",
    "tslint-config-prettier"
  ],
  "rules": {
    "mocha-no-side-effect-code": false,
    "missing-jsdoc": false,
    "no-relative-imports": false,
    "export-name": false,
    "promise-function-async": false,
    "no-void-expression": false,
    "no-redundant-jsdoc": false,
    "prefer-type-cast": false,
    "typedef": [
      true,
      "parameter",
      "arrow-parameter",
      "property-declaration",
      "member-variable-declaration"
    ]
  }
}
