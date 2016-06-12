# Match Pattern

[![NPM Version](https://img.shields.io/npm/v/lodash-match-pattern.svg)](https://www.npmjs.com/package/lodash-match-pattern)
![CircleCI](https://circleci.com/gh/Originate/lodash-match-pattern.svg?style=shield&circle-token=:circle-token)
[![David Dependencies](https://david-dm.org/Originate/lodash-match-pattern.svg)](https://david-dm.org/Originate/lodash-match-pattern)
[![David devDependencies](https://david-dm.org/Originate/lodash-match-pattern/dev-status.svg)](https://david-dm.org/Originate/lodash-match-pattern#info=devDependencies)

Related Modules:
[![chai-match-pattern](https://img.shields.io/npm/v/chai-match-pattern.svg?label=chai-match-pattern)](https://www.npmjs.com/package/chai-match-pattern)
[![lodash-checkit](https://img.shields.io/npm/v/lodash-checkit.svg?label=lodash-checkit)](https://www.npmjs.com/package/lodash-checkit)

This is a general purpose validation tool for JSON objects. It includes facilities for deep matching, partial matching, unordered lists, and several advanced features for complex patterns.  It also includes a variety of validation functions from the [`lodash-checkit`](https://github.com/originate/lodash-checkit) module (a [`lodash`](https://lodash.com/docs) extension mashup with [`checkit`](https://github.com/tgriesser/checkit)), and it allows for custom checking and mapping functions.

The primary goal of this and the supporting modules is to enable the highly flexible, expressive, and resilient feature testing of JSON based APIs.

#### Basic Usage
```
npm install lodash-match-pattern --save-dev
```
In your test file insert
```javascript
var matchPattern = require('lodash-match-pattern');
var _ = matchPattern.getLodashModule(); // Use our lodash extensions (recommended)

// Example usage:

var testValue = {a: 1, b: 'abc'};

var successResult = matchPattern(testValue, {a: 1, b: _.isString});
// returns null for a successful match.

var failResult = matchPattern(testValue, {a: _.isString, b: 'abc'});
// returns "{a: 1} didn't match target {a: '_.isString'}"
```

#### Features Index

You probably won't need all of these features, but there's plenty of flexibility to to adapt to the details of your specific use cases. All of the examples below are illustrated in the [`examples/example1/features/basic.feature`](https://github.com/Originate/lodash-match-pattern/blob/master/examples/example1/features/basic.feature) as cucumber-js tests.

1. [Deep JSON matching](#deep-json-matching)
1. [Matching property types](#matching-property-types)
1. [Partial objects](#partial-objects)
1. [Partial, superset, and unordered arrays](#partial-superset-and-unordered-arrays)
1. [Omitted items](#omitted-items)
1. [Parametrized matchers](#parametrized-matchers)
1. [Transforms](#transforms)
  1. [Apply transform example](#apply-transform-example)
  1. [Map pattern transform example](#map-pattern-transform-example)
  1. [Map values transform example](#map-values-transform-example)
  1. [Composition and multiple transforms](#composition-and-multiple-transforms)
1. [Memoization of test values](#memoization-of-test-values)
1. [Customization](#customization)
1. [Extras](#extras)

#### Specification with JavaScript Objects or "Pattern Notation"

There are two similar ways to specify patterns to match. JavaScript objects are more convenient for `mocha` and JavaScript test runners that aren't multiline string friendly. "Pattern Notation" is more readable in `cucumber` tests and other environments that support multiline strings. Almost all patterns can be expressed in either form. In most cases below examples will be shown in both forms.

## Deep JSON matching

Just for starters, suppose we have a "joeUser" object and want to validate its exact contents.  Then `matchPattern` will do a deep match of the object and succeed as expected.
<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
var matchPattern = require('lodash-match-pattern');
var joeUser = getJoeUser();

describe('basic match', function () {
  it('matches joeUser', function () {
    var matchResult = matchPattern(joeUser,
{
  id: 43,
  email: 'joe@matchapattern.org',
  website: 'http://matchapattern.org',
  firstName: 'Joe',
  lastName: 'Matcher',
  createDate: '2016-05-22T00:23:23.343Z',
  tvshows: [
    'Match Game',
    'Sopranos',
    'House of Cards'
  ],
  mother: {
    id: 23,
    email: 'mom@aol.com'
  },
  friends: [
    {id: 21, email: 'pat@mp.co', active: true},
    {id: 89, email: 'gerri@mp.co', active: false},
    {id: 14, email: 'kim@mp.co', active: true}
  ]
};
    if (matchResult) throw(new Error(matchResult));
  });
});
</pre></td><td><pre>
  Given I have joeUser
  Then joeUser matches the pattern
    """
{
  id: 43,
  email: 'joe@matchapattern.org',
  website: 'http://matchapattern.org',
  firstName: 'Joe',
  lastName: 'Matcher',
  createDate: '2016-05-22T00:23:23.343Z',
  tvshows: [
    'Match Game',
    'Sopranos',
    'House of Cards'
  ],
  mother: {
    id: 23,
    email: 'mom@aol.com'
  },
  friends: [
    {id: 21, email: 'pat@mp.co', active: true},
    {id: 89, email: 'gerri@mp.co', active: false},
    {id: 14, email: 'kim@mp.co', active: true}
  ]
});
    """
</pre></td></tr>
</table>

##### Notes
* In this case the JS Object and the Pattern Notation are visually identical. The only difference is the first is a JS object and the second is a string.
* For all the following examples we'll leave out the surrounding test boiler plate.
* For completeness the cucumber step definitions could be defined as:

```javascript
// steps.js
var matchPattern = require('lodash-match-pattern');
module.exports = function () {
  var self = this;

  self.Given(/^I have joeUser$/, function () {
    self.user = {
      id: 43,
      email: 'joe@matchapattern.org',
      ...
    }
  });

  self.Then(
    /^joeUser matches the pattern$/,
    function (targetPattern) {
      var matchResult = matchPattern(self.user, targetPattern);
      if (matchResult) throw matchResult;
    }
  );
};
```

Unfortunately, deep matching of exact JSON patterns creates over-specified and brittle feature tests. In practice such deep matches are only useful in small isolated feature tests and occasional unit tests. Just for example, suppose you wanted to match the exact `createDate` of the above user. Then you might need to do some complex mocking of the database to spoof a testable exact value. But the good news is that we don't really care about the exact date, and we can trust that the database generated it correctly. All we really care about is that the date looks like a date. To solve this and other over-specification problems `lodash-match-pattern` enables a rich and extensible facility for data type checking.


## Matching property types

The pattern below may look a little odd at first, but main idea is that there's a bucket full of `_.isXxxx` matchers available to check the property types. All you need to do is slug in the pattern matching function and that function will be applied to the corresponding candidate value.
<table><tr>
<th>JavaScript Objects and Pattern Notation are identical</th>
</tr>
<tr><td><pre>
{
  id: _.isInteger,
  email: _.isEmail,
  website: _.isUrl,
  firstName: /[A-Z][a-z]+/,
  lastName: _.isString,
  createDate: _.isDateString,
  tvshows: [
    _.isString,
    _.isString,
    _.isString
  ],
  mother: _.isObject,
  friends: _.isArray
}
</pre></td></tr>
</table>

##### Notes
* Again the two forms are visually identical. However there's one significant difference. For the JS Objects the matching functions (e.g `_.isString`) can be any function in scope. In contrast the corresponding Pattern Notation functions are required to be members of our lodash extension module and are required to begin with "is".

* The available matching functions are
  1. All `isXxxx` functions from `lodash`.
  1. All validation functions from `checkit` with `is` prepended.
  1. Case convention matchers constructed from lodash's `...Case` functions.
  1. Any regular expression -- intepreted as `/<regex>/.test(<testval>)`.
  1. `isDateString`, `isSize`, `isOmitted` which have been added via [lodash mixins]{(https://github.com/Originate/lodash-match-pattern/blob/master/lib/mixins.js).
  1. Any `isXxxx` function you insert as a lodash mixin through [customization](#customization).

To see the full list run this:
```
console.log(
  Object.keys(require('lodash-match-pattern').getLodashModule())
  .filter(function (fname) { return /^is[A-Z]/.test(fname) })
);
```

## Partial objects

Most of the time ,feature tests are interested in how objects change, and we don't need be concerned with properties of an object that aren't involved in the change. In fact a principle of feature testing requires elimination of such incidental details.  Matching only partial objects can create a huge simplification which focuses on the subject of the test. For example if we only wanted to test changing our user's email to say "billyjoe@duckduck.go" then we can simply match the pattern:
<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  id: 43,
  email: 'billyjoe@duckduck.go',
  '...': ''
}
</pre></td><td><pre>
{
  id: 43,
  email: 'billyjoe@duckduck.go',
  ...
}
</pre></td></tr></table>

The `'...'` object key indicates that only the specified keys are matched, and all others in `joeUser` are ignored.

_Note: from here on all the examples will use partial matching, and all will successfully match "joeUser"._

## Partial, Superset, and Unordered Arrays

Similarly matching of partial arrays (as well as supersets and set equality) can be easily specified, but with a couple caveats:

1. The array entries must be numbers or strings, no nested objects or arrays.
2. The partial (and supersets) arrays are matched as sets -- no order assumed.

<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  tvshows: [
    'House of Cards',
    'Sopranos',
    '...'
  ],
  '...': ''
}
</pre></td><td><pre>
{
  tvshows: [
    'House of Cards',
    'Sopranos',
    ...
  ],
  ...
}
</pre></td></tr></table>

Note that the above specifies both a partial array (for `joeUser.tvshows`) and a partial object (for `joeUser`).

Supersets are similarly specified by '^^^'. This following says that `joeUser.tvshows` is a subset of the list in the pattern below:
<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  tvshows: [
    'House of Cards',
    'Match Game',
    'Sopranos',
    'Grey's Anatomy',
    '^^^'
  ],
  '...': ''
}
</pre></td><td><pre>
{
  tvshows: [
    'House of Cards',
    'Match Game',
    'Sopranos',
    'Grey's Anatomy',
    ^^^
  ],
  ...
}
</pre></td></tr></table>

Or to compare equality of arrays as sets by unordered membership, use "===":

<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  tvshows: [
    'House of Cards',
    'Match Game',
    'Sopranos',
    '==='
  ],
  '...': ''
}
</pre></td><td><pre>
{
  tvshows: [
    'House of Cards',
    'Match Game',
    'Sopranos',
    ===
  ],
  ...
}
</pre></td></tr></table>

Note that the JS Object specification adds the set matching symbols as extra array elements. If you actually need to literally match `"..."`, `"^^^"`, or `"==="` in an array see the [customization](#customization) example below.

## Omitted items

Sometimes an important API requirement specifies fields that should not be present, such as a `password`. This can be validated with an explicit `_.isOmitted` check (an alias of `_.isUndefined`). Note that it works properly with partial objects.

<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  id: 43,
  password: _.isOmitted,
  '...': ''
}
</pre></td><td><pre>
{
  id: 43,
  password: _.isOmitted,
  ...
}
</pre></td></tr></table>

## Parametrized matchers

Some of the matching functions take parameters. These can be specified with "|" separators at the end of the matching function.
<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  id: _.isBetween|42.9|43.1,
  tvshows: '_.isContainerFor|'House of Cards'',
  '...': ''
}
</pre></td><td><pre>
{
  id: _.isBetween|42.9|43.1,
  tvshows: _.isContainerFor|'House of Cards',
  ...
}
</pre></td></tr></table>

## Transforms

Transforms modify the test data in some way before applying a match pattern. Transforms can be applied at any level of the match object and they may be composed. Use transforms sparingly since they tend to make the patterns less readable, and they could be a code smell of excessively complex tests. In many cases separate tests or custom matcher will be clearer.

#### Apply Transform Example

As a simple motivation consider matching a compound object such at the joeUser's friends list. We may not be able to guarantee order of items returned in the list, and probably don't care anyway. So explicitly matching the friends in a specific order will probably be an unreliable test. (The above "===" array set specifier only applies to arrays of primitives.) To fix this a `<-.sortBy` transform can be applied to force the test data into a specific order that can be reliably tested.

<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  friends: {
    '<-.sortBy|email': [
      {id: 89, email: 'gerri@mp.co', active: false},
      {id: 14, email: 'kim@mp.co', active: true},
      {id: 21, email: 'pat@mp.co', active: true}
    ]
  },
  '...': ''
}
</pre></td><td><pre>
{
  friends: {
    <-.sortBy|email: [
      {id: 89, email: 'gerri@mp.co', active: false},
      {id: 14, email: 'kim@mp.co', active: true},
      {id: 21, email: 'pat@mp.co', active: true}
    ]
  },
  ...
}
</pre></td></tr></table>

Any function in `lodash-checkit` is available for use in transforms, along with any function you add via customization. The functions are applied with the `testValue` as the function's first argument, and additional `|` separated arguments can be specified after the function name.

Important Note: The transform functions are applied to the test value, NOT the corresponding test pattern. In this example we are testing the `joeUser.friends` list. So this list is sorted by `email` and the resulting array is tested against the pattern specified in the above array pattern.

#### Map Pattern Transform Example

Suppose you just wanted to check that all of of joeUser's friends have emails `...@mp.co`.

<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  friends: {
    '<=': { email: /@mp.co$/, '...': ''}
  },
  '...': ''
}
</pre></td><td><pre>
{
  friends: {
    <=: { email: /@mp.co$/, ...}
  },
  ...
}
</pre></td></tr></table>

The `<=` specifies that the pattern is applied to each of the entries of the `joeUser.friends` array. This is in contrast to the `<-` operator would specify that the pattern is matched against the array as a whole.


#### Map Values Transform Example

Suppose you wanted to check that joeUser's friends are in a "whitelist" of emails. Then you need to extract the emails, and since the whitelist check is case insensitive you need to compare them all in lower case. The following example expresses these requirements:

<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  friends: {
    '<=.get|email': {
      '<=.toLower': [
        'pat@mp.co',
        'gerri@mp.co',
        'kim@mp.co',
        'paula@mp.co',
        '^^^': ''
      ]
    }
  },
  '...': ''
}
</pre></td><td><pre>
{
  friends: {
    <=.get|email: {
      <=.toLower: [
        'pat@mp.co',
        'gerri@mp.co',
        'kim@mp.co',
        'paula@mp.co',
        ^^^
      ]
    }
  },
  ...
}
</pre></td></tr></table>

Here `<=.get|email` specifies that the `_.get(..., 'email')` is applied to each of the entries of the `joeUser.friends` array and creates a new array.  In turn `<=.toLower` creates a mapped array with all emails in lower case. The result is then compared to the given whitelist.

Map transforms can be applied to objects as well as arrays. For arrays `<=.lodashFunction` uses `_.map` to apply `_.lodashFunction` to each array element. For objects `_.mapValues` is used instead.


#### Composition and Multiple Transforms

Transformations can be mixed and matched. Multiple transforms can also appear as keys in a single object. In that case they check the test value against all their respective pattern values. Notice, as suggested in the previous example, transform compositions are always applied to the test value from the outside to the inside where they result in the final pattern match.

In the following artificial example verifies that `joeUser` has "2" active friends, in 4 different ways.

<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  friends: {
    '<-.filter|active': {
      '<-.size': 2,
      '<-': _.isSize|2,
      '<-.isSize|2': true
    },
    '<=.get|active': {
      '<=.toNumber': {
        '<-.sum': 2
      }
    }
  },
  '...': ''
}
</pre></td><td><pre>
{
  friends: {
    <-.filter|active: {
      <-.size: 2,
      <-: _.isSize|2,
      <-.isSize|2: true
    },
    <=.get|active: {
      <=.toNumber: {
        <-.sum: 2
      }
    }
  },
  ...
}

</pre></td></tr></table>

## Memoization of test values

Sometimes we're interested in comparing values from two sources. In particular in this example we are want to check that duplicating a user copies some fields and updates others. So we memoize the fields we're interested in and compare them to the dup.
```cucumber
  Scenario: Dupicating a user updates id and createDate but copies email and tvshows
    When the user matches the pattern
      """
      {
        id: {<-.setMemo|id: _.isInteger},
        email: _.isSetAsMemo|email,
        createDate: _.isSetAsMemo|createDate,
        tvshows: _.isSetAsMemo|tvshows,
        ...
      }
      """
    And the user is duplicated
    Then the duplicate user matches the pattern
      """
      {
        id: _.isNotEqualToMemo|id,
        email: _.isEqualToMemo|email,
        createDate: _.isNotEqualToMemo|createDate,
        tvshows: _.isEqualToMemo|tvshows,
        ...
      }
      """
```
Notes:

1. The above demonstrates both the transform `_.setMemo`, and the matcher `_.isSetAsMemo`. As lodash functions the only difference is that `_.setMemo` passes the source value through as its return value so that it can be matched as needed.  In contrast `_.isSetAsMemo` always returns true so it's cleaner when you're just interested saving the source value as a memo.
2. Obviously memoizing is more valuable for cucumber feature tests, since you can just use native JavaScript variables in mocha unit tests.
3. In addition to the above there is also a `_.clearMemos` function that should be executed in the `Before` or `After` routine for each test to ensure a clean slate of memos.

## Customization

In many cases, application of transforms will create unintuitive and hard to understand pattern specifications. Fortunately creating custom matchers and custom transforms is easily accomplished via lodash mixins. For our examples we've added two lodash mixins in our example code:
```
var matchPattern = require('lodash-match-pattern');
var _ = matchPattern.getLodashModule();

_.mixin({
  literalSetToken: function (elem) {
    if (elem === '...') return 'LITERAL...';
    if (elem === '^^^') return 'LITERAL^^^';
    if (elem === '===') return 'LITERAL===';
    return elem;
  },

  isActiveSize: function (array, size) {
    if (! _.isArray(array)) return false;
    var activeSize = _.size(_.filter(array, 'active'));
    return activeSize === size;
  }
});
```
Then we have yet another (but simpler) method for counting joeUser's active friends.
```
{
  friends: _.isActiveSize|2,
  ...
}
```

The custom `literalSetToken` transform can be used to enable literal pattern matching of "..." and "---" in arrays. So for example, suppose for some reason `joeUser` had this as his actual `tvshows` list:
```
  [
    "===",
    "Mannix",
    "Game of Thrones",
    "...",
    "^^^"
  ]
```
Then the following now has a successful pattern match:

<table><tr>
<th>JavaScript Objects (mocha)</th><th>Pattern Notation (cucumber)</th>
</tr>
<tr><td><pre>
{
  tvshows: {
    '<=.literalSetToken': [
      'LITERAL===',
      'Mannix',
      'Game of Thrones',
      'LITERAL...',
      'LITERAL^^^'
    ]
  },
  '...': ''
}
</pre></td><td><pre>
{
  tvshows: {
    <=.literalSetToken: [
      'LITERAL===',
      'Mannix',
      'Game of Thrones',
      'LITERAL...',
      'LITERAL^^^'
    ]
  },
  ...
}
</pre></td></tr></table>

## Extras

Here are some miscellaneous lodash additions that may come in handy. The source code of each of these is just a few lines in [lib/mixins.js](https://github.com/Originate/lodash-match-pattern/blob/master/lib/mixins.js).

* `_.filterPattern` -- a transform function that takes a pattern as an argument. This is most useful for filtering rows from a database whose column values match certain characteristics.
  * For example `<-.filterPattern|"{age: _.isInRange|0|18, ...}"` will filter leaving only the rows where `age` is in the range `[0, 18]`.  Notice that this is taking advantage of partial pattern matching with the `...`
* `_.isDateString` -- a matcher for strings that are parseable into dates (e.g. ISO Date strings).
* `_.isPrinted` -- a matcher that always matches, but prints the source values that it is matching against. This is most useful for seeing the results of transforms.
* `_.isOmitted` -- an alias for `_.isUndefined`. As shown in an example above this is more semantically meaningful for matching intentionally omitted properties of an object.
* `_.isSize` -- the matcher corresponding to the standard lodash `_.size`. It checks it's argument against the `_.size` of the source object.
