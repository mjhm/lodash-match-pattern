
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
  [true,  {targ:{a: 5, b: '_.isUndefined'}, src: {a: 5}}], // _.isUndefined matches an omitted entry
  [true,  {targ:{a: 5, b: undefined}, src: {a: 5}}],
  [true,  {targ: '_.isInRange:0:10', src: 0}],
  [true,  {targ: '_.isInRange:3.1:7.7', src: 5}],
  [false, {targ: '_.isInRange:3.1:7.7', src: 2}],
  [true,  {targ: '_.isContainerFor:king', src: 'rocking chair'}],
  [true,  {targ: '_.isContainerFor:4', src: [2, 3, 4, 5]}],
  [true,  {targ: '_.isContainerFor:abc', src: {abc: 1, def: 2}}],
  [true,  {targ: {a: {'_.sortBy': [1, 2, 3]}}, src: {a: [2, 3, 1]}}],
  [true,  {targ: {'_.sortBy:a': [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 1}]},
            src: [{a: 2, b: 3}, {a: 1, b: 2}, {a: 3, b: 1}]}]
];


describe('#matchPattern', function () {
  matchPatternTests.forEach(function(tst) {
    var desc = (tst[0] ? 'succeeds' : 'fails') + (" for " + (util.inspect(tst[1])));

    it(desc, function() {
      var matchResult = matchPattern(tst[1].src, tst[1].targ);
      if (tst[0]) {
        return expect(matchResult).to.be.null
      } else {
        return expect(matchResult).not.to.be.null
      }
    });

  });
});

describe('#fillSrcWithVoids', function () {
  var fillSrcTests = [
    '{targ: {a: 2, b: 2}, src: {a: 1}, result: {a: 1, b: undefined}}',
    '{targ: {a: 2, b: 2}, src: {a: 1, c: 1}, result: {a: 1, c: 1, b: undefined}}',
    '{targ: {a: 2, b: 2, "...": ""}, src: {a: 1, c: 1}, result: {a: 1, b: undefined}}'
  ];
  fillSrcTests.forEach(function (test) {
    var testData = new Function('return ' + test)()
    var fillSrcWithVoids = matchPattern.__get__('fillSrcWithVoids');

    it(test, function () {
      expect(fillSrcWithVoids(testData.targ, testData.src)).to.deep.equal(testData.result);
    });
  });
});

describe('#fillTargWithVoids', function () {
  var fillTargTests = [
    '{targ: {a: 2, b: 2}, src: {a: 1}, result: {a: 2, b: 2}}',
    '{targ: {a: 2, b: 2}, src: {a: 1, c: 1}, result: {a: 2, c: undefined, b: 2}}',
    '{targ: {a: 2, b: 2, "...": ""}, src: {a: 1, c: 1}, result: {a: 2, b: 2, c: undefined}}'
  ];
  fillTargTests.forEach(function (test) {
    var testData = new Function('return ' + test)()
    var fillTargWithVoids = matchPattern.__get__('fillTargWithVoids');

    it(test, function () {
      expect(fillTargWithVoids(testData.targ, testData.src)).to.deep.equal(testData.result);
    });
  });
});
