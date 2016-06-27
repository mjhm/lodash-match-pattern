# Match Pattern
[![NPM](https://nodei.co/npm/lodash-match-pattern.png?downloads=true)](https://github.com/originate/lodash-match-pattern)

![CircleCI](https://circleci.com/gh/Originate/lodash-match-pattern.svg?style=shield&circle-token=:circle-token)
[![David Dependencies](https://david-dm.org/Originate/lodash-match-pattern.svg)](https://david-dm.org/Originate/lodash-match-pattern)
[![David devDependencies](https://david-dm.org/Originate/lodash-match-pattern/dev-status.svg)](https://david-dm.org/Originate/lodash-match-pattern#info=devDependencies)


Related Modules:
[![chai-match-pattern](https://img.shields.io/npm/v/chai-match-pattern.svg?label=chai-match-pattern)](https://www.npmjs.com/package/chai-match-pattern)
[![lodash-checkit](https://img.shields.io/npm/v/lodash-checkit.svg?label=lodash-checkit)](https://www.npmjs.com/package/lodash-checkit)

**Match Pattern** is a Swiss Army Knife for validating JSON objects. Its primary goal is to enable the highly flexible, expressive, and resilient feature testing of JSON based APIs. It includes facilities for deep matching, partial matching, unordered lists, and several advanced features for complex patterns.  It also bundles a variety of validation functions from the [`lodash`](https://lodash.com/docs) and [`checkit`](https://github.com/tgriesser/checkit) modules, and it supports custom matching and mapping functions.

#### Basic Usage
```
npm install lodash-match-pattern --save-dev
```
In your test file insert
```javascript
var matchPattern = require('lodash-match-pattern');
var _ = matchPattern.getLodashModule(); // Use our lodash extensions (recommended)

// Real simple example usage:

var testValue = {a: 1, b: 'abc'};

var successResult = matchPattern(testValue, {a: 1, b: _.isString});
// returns null for a successful match.

var failResult = matchPattern(testValue, {a: _.isString, b: 'abc'});
// returns "{a: 1} didn't match target {a: '_.isString'}"
```

#### Here's what this module does for you

You may not need all of these features, but they're worth skimming. You'll likely find lots of flexibility for your specific use cases. The included examples are illustrated with live code as cucumber-js tests in [`examples/example1/features/`](https://github.com/Originate/lodash-match-pattern/blob/master/examples/example1/features/) and as mocha tests in
[`examples/example1/test/`](https://github.com/Originate/lodash-match-pattern/blob/master/examples/example1/test/).

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

#### Specification with "Pattern Notation" or JavaScript Objects

As illustrated in the [cucumber examples](https://github.com/Originate/lodash-match-pattern/blob/master/examples/example1/features), our target use case is pattern matching in [CucumberJS](https://github.com/cucumber/cucumber-js). The "Pattern Notation" is a JSON-like DSL designed for readability in Cucumber tests. However almost all of the functionality is also available using actual JSON objects which may be more convenient for "mocha" and other unit testing frameworks. For a comparision see the [mocha examples](https://github.com/Originate/lodash-match-pattern/blob/master/examples/example1/features_mocha)


## Deep JSON matching

Just for starters, suppose we have a `joeUser` object and want to validate its exact contents.  Then `matchPattern` will do a deep match of the object and succeed as expected. *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/basic.feature#L6)]*

```cucumber

  Given I have joeUser
  Then joeUser matches the pattern
    """
    {
      id: 43,
      email: 'joe@matchapattern.org',
      website: 'http://matchapattern.org',
      firstName: 'Joe',
      lastName: 'Matcher',
      phone: '(333) 444-5555',
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
    }
    """
```

Unfortunately, deep matching of exact JSON patterns creates over-specified and brittle feature tests. In practice such deep matches are only occasionally useful. Just for example, suppose you wanted to match the exact `createDate` of the above user. Then you'd need to do some complex mocking of the database to spoof a testable exact value. But the good news is that we don't really care about the exact date, and we can trust that the database generated it correctly. All we really care about is that the date looks like a date. To solve this and other over-specification problems `lodash-match-pattern` enables a rich and extensible facility for data type checking.


## Matching property types

There's a bucket full of `_.isXxxx` matchers available to check property types, and if those aren't enough, you can match by regex as well. All you need to do is slug in the pattern matching function (or regex) and that function will be applied to the candidate value. *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/basic.feature#L34)]*

```javascript
{
  id: _.isInteger,
  email: _.isEmail,
  website: _.isUrl,
  firstName: /[A-Z][a-z]+/,
  lastName: _.isString,
  phone: /\(\d{3}\)\s*\d{3}[- ]\d{4}/,
  createDate: _.isDateString,
  tvshows: [
    _.isString,
    _.isString,
    _.isString
  ],
  mother: _.isObject,
  friends: _.isArray
}
```

* The available matching functions are
  1. All `isXxxx` functions from `lodash`.
  1. All validation functions from `checkit` with `is` prepended.
  1. Case convention matchers constructed from lodash's `...Case` functions.
  1. Any regular expression -- intepreted as `/<regex>/.test(<testval>)`.
  1. `isPrinted`, `isDateString`, `isSize`, `isOmitted` which have been added via [lodash mixins](https://github.com/Originate/lodash-match-pattern/blob/master/lib/mixins.js).
  1. Any `isXxxx` (or `hasXxxx`) function you insert as a lodash mixin through [customization](#customization).

To see the full list run this:
```javascript
console.log(
  Object.keys(require('lodash-match-pattern').getLodashModule())
  .filter(function (fname) { return /^(is|has)[A-Z]/.test(fname) })
);
```

## Partial objects

Most feature tests are interested in how objects change, so we're not usually concerned with properties that aren't involved in the change. In fact best practices of feature testing suggest elimination of such incidental details.  Matching only partial objects can create a huge simplification which focuses on the subject of the test. For example if we only wanted to test changing our user's email to say `billyjoe@duckduck.go` then we can simply match the pattern *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/basic.feature#L55)]*:

```javascript
{
  id: 43,
  email: 'billyjoe@duckduck.go'
  ...
}
```

The `...` indicates that only the specified keys are matched, and all others in `joeUser` are ignored.

_Note: All the following examples will use partial matching._

## Partial, Superset, and Unordered Arrays

Similarly matching of partial arrays (as well as supersets and set equality) can be easily specified, but with a couple caveats:

1. The array entries must be numbers or strings, no nested objects or arrays.
2. The partial (and supersets) arrays are matched as sets -- no order assumed.

*[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/basic.feature#L66)]*:

```javascript
{
  tvshows: [
    'House of Cards',
    'Sopranos',
    ...
  ]
  ...
}
```

_Note that the above has two partial symbols "`...`" One for the partial array (`joeUser.tvshows`) and one for the partial object (`joeUser`).

Supersets are similarly specified by `^^^`. The following says that `joeUser.tvshows` is a subset of the list in the pattern below:

```javascript
{
  tvshows: [
    'House of Cards',
    'Match Game',
    'Sopranos',
    "Grey's Anatomy",
    ^^^
  ]
  ...
}
```

Or to compare equality of arrays as sets by unordered membership, use `===`:

```
{
  tvshows: [
    'House of Cards',
    'Match Game',
    'Sopranos',
    ===
  ]
  ...
}
```

## Omitted items

Sometimes an important API requirement specifies fields that should not be present, such as a `password`. This can be validated with an explicit `_.isOmitted` check. Note that it works properly with partial objects. *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/basic.feature#L94)]*:

```javascript
{
  id: 43,
  password: _.isOmitted
  ...
}
```

## Parametrized matchers

Some of the matching functions take parameters. These can be specified with "|" separators at the end of the matching function. *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/basic.feature#L104)]*:

```javascript
{
  id: _.isBetween|42.9|43.1,
  tvshows: _.isContainerFor|'House of Cards',
  ...
}
```

## Transforms

Transforms modify the test data in some way before applying a match pattern. Transforms can be applied at any level of the match object and they may be composed. _(Although they are can be very handy, you should use transforms sparingly since they tend to make the patterns less readable, and they could be a code smell of excessively complex tests. In many cases separate tests or a custom matcher will be clearer.)_

#### Apply Transform Example

As motivation consider matching a compound object such at the `joeUser`'s friends list. We may not be able to guarantee order of items in the list, and probably don't care anyway. So simply matching the friends list with a set order will likely be an unreliable test. To fix this a `<-.sortBy` transform can be applied to force the test data into a specific order that can be reliably tested. *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/transforms.feature#L6)]*

```javascript
{
  friends: {
    <-.sortBy|email: [
      {id: 89, email: 'gerri@mp.co', active: false},
      {id: 14, email: 'kim@mp.co', active: true},
      {id: 21, email: 'pat@mp.co', active: true}
    ]
  }
  ...
}
```

Any function in `lodash-checkit` is available for transforms, along with a few [extras](#extras) below, and any function you add via customization. The functions are applied with the `testValue` as the function's first argument, and additional `|` separated arguments can be specified after the function name.

Important Note: The transform functions are applied to the test value, NOT the corresponding test pattern. In this example we're testing the `joeUser.friends` list. So this list is sorted by `email` and the resulting array is tested against the above pattern.

#### Map Pattern Transform Example

Suppose you just wanted to check that all of of joeUser's friends have emails `...@mp.co`. *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/transforms.feature#L21)]*

```javascript
{
  friends: {
    <=: { email: /@mp.co$/, ...}
  }
  ...
}
```

The `<=` says that the pattern is applied to each of the entries of the `joeUser.friends` array. In contrast, the `<-` operator would say that the pattern is matched against the array as a whole.


#### Map Values Transform Example

Suppose you want to check that `joeUser`'s friends are in a "whitelist" of emails. Then you need to extract the emails, and since the whitelist check is case insensitive you need to compare them all in lower case. *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/transforms.feature#L32)]*

```javascript
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
  }
  ...
}
```

Here `<=.get|email` says that `_.get(..., 'email')` is applied to each of the entries of the `joeUser.friends` array and creates a new array which is passed in turn to `<=.toLower` which creates a mapped array with all emails in lower case. The result is then compared to the given whitelist.

Map transforms (`<=.`) can be applied to objects as well as arrays. For arrays `<=.lodashFunction` uses `_.map` to apply the `_.<lodashFunction>` to each array element. For objects `_.mapValues` is used instead.


#### Composition and Multiple Transforms

Transformations can be mixed and matched. Multiple transforms can also appear as keys in a single object. In that case they check the test value against all their respective pattern values. Notice, as suggested in the previous example, transform compositions are always applied to the test value from the outside to the inside where they result in the final pattern match.

The following artificial example verifies that `joeUser` has `2` active friends, in four different ways. *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/transforms.feature#L51)]*

```javascript
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
  }
  ...
}
```

## Memoization of test values

Sometimes we're interested in comparing values from two steps. In this example, we want to check that duplicating a user copies some fields and updates others. So we memoize fields we're interested in and compare them to the dup. *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/memoization.feature#L6)]*
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
Memoization notes:

1. The above demonstrates both the transform `_.setMemo`, and the similar matcher `_.isSetAsMemo`. As lodash functions the only difference is that `_.setMemo` passes the source value through so that it can be matched downstream. In contrast `_.isSetAsMemo` is a matcher that always returns true.  Use `_.isSetAsMemo` when you're just interested saving the source value as a memo.
2. Obviously memoizing is more valuable for cucumber feature tests. You can just use native JavaScript variables in mocha unit tests.
3. In addition to the above there is also a `_.clearMemos` function that should be executed in the `Before` or `After` routine for each test to ensure a clean slate of memos.

## Customization

In many cases, application of transforms will create unintuitive and hard to understand pattern specifications. Fortunately creating custom matchers and custom transforms is easy via lodash mixins. Here we've added two custom lodash mixins:
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
This gives us yet another (but simpler) method for counting joeUser's active friends. *[[code](https://github.com/Originate/lodash-match-pattern/blob/jm20160625/examples/example1/features/customization.feature#L6)]*
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

```javascript
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
```

## Extras

Here are some miscellaneous lodash additions that may come in handy. The source code of each of these is just a few lines in [lib/mixins.js](https://github.com/Originate/lodash-match-pattern/blob/master/lib/mixins.js).

* `_.isPrinted` -- a matcher that always matches, but prints the source values that it is matching against. This is super useful for seeing the results of transforms.
* `_.extractUrls` -- a transform that takes a string and returns an array of parsed Url objects from the string.
* `_.filterPattern` -- a transform function that takes a pattern as an argument. This is most useful for filtering rows from a database whose column values match certain characteristics.
  * For example `<-.filterPattern|"{age: _.isInRange|0|18 ...}"` will filter leaving only the rows where `age` is in the range `[0, 18]`.  Notice that this is taking advantage of partial pattern matching with the `...`
* `_.isDateString` -- a matcher for strings that are parseable into dates (e.g. ISO Date strings).
* `_.isOmitted` -- an alias for `_.isUndefined`. As shown in an example above this is more semantically meaningful for matching intentionally omitted properties of an object.
* `_.isSize` -- the matcher corresponding to the standard lodash `_.size`. It checks it's argument against the `_.size` of the source object.
