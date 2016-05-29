
'use strict';

var chai = require('chai');
var util = require('util');
var _ = require('lodash-checkit');
var rewire = require('rewire');
var expect = chai.expect;
var matchPattern = rewire('../');
var only = 'only';

var checkMessages = true;

Function.prototype.commentToString = function () {
  return this.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];
}

var runTestList = function (testList) {
  var onlyTests = [];
  var noSkipTests = [];
  testList.forEach(function (tst) {
    if (tst[0] === 'only') {
      onlyTests.push(tst.slice(1));
    }
    if (tst[0] !== 'skip') {
      noSkipTests.push(tst);
    }
  });

  (onlyTests.length ? onlyTests : noSkipTests).forEach(function(tst) {
    var expectedResult = 'fails';
    if (tst[0] === 'throw') {
      expectedResult = 'throws';
    } else if (tst[0]) {
      expectedResult = 'succeeds';
    }
    var desc = expectedResult + (" for " + (util.inspect(tst[1], {depth: 3})));

    it(desc, function() {
      if (tst[0] === 'throw') {
        expect(matchPattern.bind(null,tst[1].src, tst[1].targ))
          .to.throw(checkMessages ? /^Testing Message$/ : Error)
        return;
      }
      var matchResult = matchPattern(tst[1].src, tst[1].targ);
      if (tst[0]) {
        return expect(matchResult).to.be.null
      } else {
        if (checkMessages) console.log('error message', matchResult);
        return expect(matchResult).to.be.a('string');
      }
    });

  });
};

describe('matchPattern', function () {
  describe('objectPatterns', function () {

    describe('basic tests', function () {
      runTestList([
        [true,  {targ:{a: {b: 2}}, src: {a: {b: 2}}}],              // OK returns null
        [false, {targ:{a: {b: 2}}, src: {a: {b: 3}}}],              // not OK deep compare fails
        [false,  {targ: {}, src: 5}],
        [false,  {targ: {a: 1}, src: 5}],
        [true,  {targ:{a: {b: '_.isNumber'}}, src: {a: {b: 3}}}],   // OK deep compare of type succeeds
        [false, {targ:{a: {b: '_.isNumber'}}, src: {a: {b: '3'}}}], // not OK deep compare of type fails
        [true,  {targ: '_.isDateString', src: '2016-05-22T00:23:23.343Z'}],
        [false, {targ: '_.isDateString', src: 0}],
        [false, {targ:{a: {b: '_.isNull'}}, src: {a: {b: 'not null'}}}],
        [true,  {targ:{a: {b: '_.isNull'}}, src: {a: {b: null}}}],
        [true,  {targ:{a: '_.isString'}, src: {a: 'a string'}}],
        [true,  {targ:['_.isString', '_.isNumber'], src: ['a string', 24]}],
        [false, {targ:['_.isString', '_.isNumber'], src: ['a string', '24']}],
        [false, {targ:[{a: {b: 2}}, '_.isNumber'], src: [{a: {b: 3}}, '24']}],
        [false, {targ:{a: null}, src: {a: 'notNull'}}],
        [true,  {targ:{a: null}, src: {a: null}}],
        [false, {targ:{a: 5}, src: {a: 5, b: 2}}],
        [false, {targ:{a: 5, b: 2}, src: {b: 2}}],
        [true,  {targ: '_.isUrl', src: 'https://my.testurl.com'}],
        [false, {targ: '_.isUrl', src: 'hbbp://my.testurl.com'}],
        [true,  {targ:{a: 5, b: '_.isOmitted'}, src: {a: 5}}],
        [true,  {targ:{a: 5, b: undefined}, src: {a: 5}}],
        [true,  {targ: [1, 2, 3], src: [1, 2, 3]}],
        [false, {targ: [1, 2, 3], src: [1, 4, 3]}],
      ]);
    });

    describe('subset, superset, equalset', function () {
      runTestList([
        [true,  {targ:{a: {b: 2, '...': ''}}, src: {a: {b: 2, c: 3, d: 4}}}],
        [false, {targ:{a: {b: 2, '...': ''}}, src: {a: {b: 1, c: 3, d: 4}}}],
        [true,  {targ: [1, 2, '...'], src: [3, 2, 1]}],
        [false, {targ: [1, 2, 4, '...'], src: [3, 2, 1]}],
        [true,  {targ: [1, 2, 3, '^^^'], src: [2, 1]}],
        [false, {targ: [1, 2, '^^^'], src: [3, 2, 1]}],
        [false, {targ: [1, 2, 3, '==='], src: [2, 1]}],
        [false, {targ: [1, 2, '==='], src: [3, 2, 1]}],
        [true,  {targ: [3, 1, 2, '==='], src: [3, 2, 1]}],
      ]);
    });


    describe('parametrized matchers', function () {
      runTestList([
        [true,  {targ: '_.isInRange|0|10', src: 0}],
        [true,  {targ: '_.isInRange|3.1|7.7', src: 5}],
        [false, {targ: '_.isInRange|3.1|7.7', src: 2}],
        [true,  {targ: '_.isContainerFor|king', src: 'rocking chair'}],
        [true,  {targ: '_.isContainerFor|4', src: [2, 3, 4, 5]}],
        [true,  {targ: '_.isContainerFor|abc', src: {abc: 1, def: 2}}],
        [true,  {targ: '_.isSize|3', src: [3, 2, 1]}],
        [true,  {targ: '_.isSize|4', src: {a: 1, b: 2, c: 3, d: 4}}],
        [true,  {targ: '_.isSize|5', src: 'abcde'}]
      ]);
    });
    describe('map and apply', function () {
      runTestList([
        ['throw',  {targ: { a: 1, '<-': 2}, src: 5}],
        [true,  {targ: {a: {'<-.sortBy': [1, 2, 3]}}, src: {a: [2, 3, 1]}}],
        [true,  {targ: {'<-.sortBy|a': [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 1}]},
                  src: [{a: 2, b: 3}, {a: 1, b: 2}, {a: 3, b: 1}]}],
        [false, {targ: {a: {'<-.sortBy': [3, 2, 1]}}, src: {a: [2, 3, 1]}}],
        [true,  {targ: {a: {'<-.keys': {'<-.size': 3}}}, src: {a: {b: 2, c: 3, d: 4}}}],
        [false, {targ: {a: {'<-.keys': {'<-.size': 2}}}, src: {a: {b: 2, c: 3, d: 4}}}],
        [true,  {targ: {'<-.size': '_.isInRange|1|3', '<-': '_.isContainerFor|apple'},
          src: ['apple', 'pair']}],
      ]);
    });

    describe('function matchers', function () {
      var match5 = function (val) { return val === 5; };
      runTestList([
        [true,  {targ: match5, src: 5}],
        [false, {targ: match5, src: 6}],
        [true,  {targ: {a: _.isNumber}, src: {a: 6}}],
        [false, {targ: {a: _.isNumber}, src: {a: '6'}}],
      ]);
    });
  });

  describe('Match Pattern format tests', function () {
    describe('basic tests', function () {
      runTestList([
        [true,    {targ: '{a: _.isNumber}', src: {a: 6}}],
        [false,   {targ: '{a: _.isNumber}', src: {a: '6'}}],
        [true,    {targ: '{ <-.without|10: [9, 11]}', src: [9, 10, 11] }],
        [false,   {targ: '{ <-.without|"10": [9, 11]}', src: [9, 10, 11] }],
        [true,    {targ: '{ <-.without|"10": ["9", "11"]}', src: ['9', '10', '11'] }],
        ['throw', {targ: '{a: _.size}', src: {a: 6}}],
        [true,    {targ: function () {/*
          {
            <-.size: 3,
            <-.without|abc|def : ['efg']
          }
        */}.commentToString(), src: ['abc', 'def', 'efg']} ],
      ]);
    })
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
