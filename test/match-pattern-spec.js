
'use strict';

var util = require('util');
var chai = require('chai');
var rewire = require('rewire');
var expect = chai.expect;
var chaiMatchPattern = require('../');
var matchPattern = rewire('../lib/match-pattern');

chai.use(chaiMatchPattern);

var matchPatternTests = [
  [true,  {targ:{a: {b: 2}}, src: {a: {b: 2}}}],              // OK returns null
  [false, {targ:{a: {b: 2}}, src: {a: {b: 3}}}],              // not OK deep compare fails
  [true,  {targ:{a: {b: '_.isNumber'}}, src: {a: {b: 3}}}],   // OK deep compare of type succeeds
  [false, {targ:{a: {b: '_.isNumber'}}, src: {a: {b: '3'}}}], // not OK deep compare of type fails
  [true,  {targ:{a: {b: '_.isDateString'}}, src: {a: {b: 'Thu Mar 17 2016 17:07:59 GMT-0700 (PDT)'}}}],
  [false, {targ:{a: {b: '_.isDateString'}}, src: {a: {b: 'not a date'}}}],
  [false, {targ:{a: {b: '_.isNull'}}, src: {a: {b: 'not null'}}}],
  [true,  {targ:{a: {b: '_.isNull'}}, src: {a: {b: null}}}],
  [true,  {targ:{a: '_.isString'}, src: {a: 'a string'}}],
  [true,  {targ:['_.isString', '_.isNumber'], src: ['a string', 24]}],    // OK array element comparison
  [false, {targ:['_.isString', '_.isNumber'], src: ['a string', '24']}],  // not OK array element comp.
  [false, {targ:[{a: {b: 2}}, '_.isNumber'], src: [{a: {b: 3}}, '24']}],      // not OK deep array
  [true,  {targ:'_.isEpochStart', src: '1970-01-01T00:00:00.000Z'}],
  [false, {targ:'_.isEpochStart', src: '2013-01-01T00:00:00.000Z'}],
  [false, {targ:{a: null}, src: {a: 'notNull'}}],
  [true,  {targ:{a: null}, src: {a: null}}],
  [true,  {targ:{a: {b: 2, '...': '...'}}, src: {a: {b: 2, c: 3, d: 4}}}],
  [false, {targ:{a: {b: 2, '...': '...'}}, src: {a: {b: 1, c: 3, d: 4}}}],
  [false, {targ:{a: 5}, src: {a: 5, b: 2}}],
  [false, {targ:{a: 5, b: 2}, src: {b: 2}}],
  [true,  {targ:{a: 5, b: undefined}, src: {a: 5}}],
  [true,  {targ: '_.isUrl', src: 'https://my.testurl.com'}],
  [true,  {targ:{a: 5, b: '_.isOmitted'}, src: {a: 5}}]
];

describe('lib/match-pattern', function() {

  describe('#matchPattern', function () {
    matchPatternTests.forEach(function(tst) {
      var desc = (tst[0] ? 'succeeds' : 'fails') + (" for " + (util.inspect(tst[1])));

      it(desc, function() {
        if (tst[0]) {
          expect(tst[1].src).to.matchPattern(tst[1].targ);
        } else {
          expect(tst[1].src).to.not.matchPattern(tst[1].targ);
        }
      });

    });
  });

  describe('#fillSrcWithVoids', function () {
    var fillSrcTests = [
      '{src: {a: 1}, targ: {a: 2, b: 2}, result: {a: 1, b: undefined}}',
      '{src: {a: 1, c: 1}, targ: {a: 2, b: 2}, result: {a: 1, c: 1, b: undefined}}',
      '{src: {a: 1, c: 1}, targ: {a: 2, b: 2, "...": "*"}, result: {a: 1, b: undefined}}'
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
      '{src: {a: 1}, targ: {a: 2, b: 2}, result: {a: 2, b: 2}}',
      '{src: {a: 1, c: 1}, targ: {a: 2, b: 2}, result: {a: 2, c: undefined, b: 2}}',
      '{src: {a: 1, c: 1}, targ: {a: 2, b: 2, "...": "*"}, result: {a: 2, b: 2, c: undefined}}'
    ];
    fillTargTests.forEach(function (test) {
      var testData = new Function('return ' + test)()
      var fillTargWithVoids = matchPattern.__get__('fillTargWithVoids');

      it(test, function () {
        expect(fillTargWithVoids(testData.targ, testData.src)).to.deep.equal(testData.result);
      });
    });
  });
});
