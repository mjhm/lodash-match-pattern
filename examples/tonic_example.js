var matchPattern = require('lodash-match-pattern');
var lodash = matchPattern.getLodashModule(); // Use our lodash extensions (recommended)
var isString = lodash.isString;
// ^^^ setting isString explicitly to overcome a REPL issue with using '_'

// Trivial example
var testValue = {a: 1, b: 'abc'};

var successResult = matchPattern(testValue, {a: 1, b: isString});
// returns null for a successful match.

var failResult = matchPattern(testValue, {a: isString, b: 'abc'});
// returns "{a: 1} didn't match target {a: \'function isString(value) {...}\'}"

// Fancy test value
var fancyValue = {
  name: 'Gale',
  email: 'gale.force@winds.com',
  age: 23,
  friends: [
    { name: 'Breeze', age: 14 },
    { name: 'Cyclone', age: 29 },
    { name: 'Gust', age: 22 }
  ]
};

// fancy match with partial match
var partialMatchResult = matchPattern(fancyValue, `{
  name: _.isString,
  email: _.isEmail,
  age: _.isBetween|20|30
  ...
}`);

// extra fancy match with filterPattern transform.
// This checks that "Gale" has two friends between the ages of 20 and 30
// and that one of them is named "Breeze".
var extraFancyResult = matchPattern(fancyValue, `{
  name: /^[A-Z]\w+$/,
  email: _.isEmail,
  age: _.isBetween|20|30,
  friends: {
    <-.filterPattern|'{age: _.isBetween|20|30 ...}': _.isSize|2,
    <=.get|name: [
      'Breeze',
      ...
    ]
  }
}`);
