
'use strict';

var chai = require('chai');
var util = require('util');
var _ = require('lodash-checkit');
var rewire = require('rewire');
var expect = chai.expect;
var matchPattern = rewire('../');

var matchPatternTests = [
  [true,  {targ:{a: {b: 2}}, src: {a: {b: 2}}}],              // OK returns null
  [false, {targ:{a: {b: 2}}, src: {a: {b: 3}}}],              // not OK deep compare fails
  [true,  {targ:{a: {b: '_.isNumber'}}, src: {a: {b: 3}}}],   // OK deep compare of type succeeds
  [false, {targ:{a: {b: '_.isNumber'}}, src: {a: {b: '3'}}}], // not OK deep compare of type fails
  [true,  {targ: '_.isDateString', src: '2016-05-22T00:23:23.343Z'}],
  [false, {targ: '_.isDateString', src: 0}],
  [false, {targ:{a: {b: '_.isNull'}}, src: {a: {b: 'not null'}}}],
  [true,  {targ:{a: {b: '_.isNull'}}, src: {a: {b: null}}}],
  [true,  {targ:{a: '_.isString'}, src: {a: 'a string'}}],
  [true,  {targ:['_.isString', '_.isNumber'], src: ['a string', 24]}],    // OK array element comparison
  [false, {targ:['_.isString', '_.isNumber'], src: ['a string', '24']}],  // not OK array element comp.
  [false, {targ:[{a: {b: 2}}, '_.isNumber'], src: [{a: {b: 3}}, '24']}],      // not OK deep array
  [false, {targ:{a: null}, src: {a: 'notNull'}}],
  [true,  {targ:{a: null}, src: {a: null}}],
  [true,  {targ:{a: {b: 2, '...': ''}}, src: {a: {b: 2, c: 3, d: 4}}}],  // partial match
  [false, {targ:{a: {b: 2, '...': ''}}, src: {a: {b: 1, c: 3, d: 4}}}],  // partial didn't match
  [false, {targ:{a: 5}, src: {a: 5, b: 2}}],
  [false, {targ:{a: 5, b: 2}, src: {b: 2}}],
  [true,  {targ: '_.isUrl', src: 'https://my.testurl.com'}],
  [false, {targ: '_.isUrl', src: 'hbbp://my.testurl.com'}],
  [true,  {targ:{a: 5, b: '_.isOmitted'}, src: {a: 5}}], // _.isUndefined matches an omitted entry
  [true,  {targ:{a: 5, b: undefined}, src: {a: 5}}],
  [true,  {targ: [1, 2, 3], src: [1, 2, 3]}],
  [false, {targ: [1, 2, 3], src: [1, 4, 3]}],
  [true,  {targ: '_.isInRange|0|10', src: 0}],
  [true,  {targ: '_.isInRange|3.1|7.7', src: 5}],
  [false, {targ: '_.isInRange|3.1|7.7', src: 2}],
  [true,  {targ: '_.isContainerFor|king', src: 'rocking chair'}],
  [true,  {targ: '_.isContainerFor|4', src: [2, 3, 4, 5]}],
  [true,  {targ: '_.isContainerFor|abc', src: {abc: 1, def: 2}}],
  [true,  {targ: {a: {'_.sortBy': [1, 2, 3]}}, src: {a: [2, 3, 1]}}],
  [true,  {targ: {'_.sortBy|a': [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 1}]},
            src: [{a: 2, b: 3}, {a: 1, b: 2}, {a: 3, b: 1}]}],
  [false, {targ: {a: {'_.sortBy': [3, 2, 1]}}, src: {a: [2, 3, 1]}}],
  [true,  {targ: {a: {'_.keys': {'_.size': 3}}}, src: {a: {b: 2, c: 3, d: 4}}}],
  [false, {targ: {a: {'_.keys': {'_.size': 2}}}, src: {a: {b: 2, c: 3, d: 4}}}],
  [true,  {targ: {'_.arrayOfDups|2': [{'_.size': '_.isInRange|1|3'}, '_.isContainerFor|apple']},
    src: ['apple', 'pair']}],
  [true,  {targ: [1, 2, '...'], src: [3, 2, 1]}],
  [false, {targ: [1, 2, 4, '...'], src: [3, 2, 1]}],
  [true,  {targ: [1, 2, 3, '---'], src: [2, 1]}],
  [false, {targ: [1, 2, '---'], src: [3, 2, 1]}],
  [true, {targ: '_.isSize|3', src: [3, 2, 1]}],
  [true, {targ: '_.isSize|4', src: {a: 1, b: 2, c: 3, d: 4}}],
  [true, {targ: '_.isSize|5', src: 'abcde'}]
];


describe('matchPattern', function () {
  matchPatternTests.forEach(function(tst) {
    var desc = (tst[0] ? 'succeeds' : 'fails') + (" for " + (util.inspect(tst[1], {depth: 3})));

    it(desc, function() {
      var matchResult = matchPattern(tst[1].src, tst[1].targ);
      if (tst[0]) {
        return expect(matchResult).to.be.null
      } else {
        console.log(matchResult)
        return expect(matchResult).to.be.a('string');
      }
    });

  });
});

describe('#use (custom lodash module)', function () {
  beforeEach(function () {
    var lodashExt = _.runInContext()
    lodashExt.mixin({
      isSmilie: function (s) {
        return s === ':)';
      }
    });
    matchPattern.use(lodashExt);
    this.smilie = ':)';
    this.winkie = ';)';
  });

  afterEach(function () {
    matchPattern.use(_);
  });

  it('succeeds with matching test data', function () {
    var matchResult = matchPattern(this.smilie, '_.isSmilie');
    return expect(matchResult).to.be.null
  });

  it('fails with non-matching test data', function () {
    var matchResult = matchPattern(this.winkie, '_.isSmilie');
    return expect(matchResult).to.be.a('string');
  });
});
