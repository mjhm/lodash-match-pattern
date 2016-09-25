
'use strict';

var chai = require('chai');
var util = require('util');
var _ = require('lodash-checkit');
var rewire = require('rewire');
var expect = chai.expect;
var matchPattern = rewire('../');
var only = 'only'; // eslint-disable-line no-unused-vars

var checkMessages = false;

Function.prototype.commentToString = function () {
  return this.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];
};

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
    var desc = expectedResult + (' for ' + (util.inspect(tst[1], {depth: 3})));

    it(desc, function() {
      if (tst[0] === 'throw') {
        if (checkMessages) {
          try {
            matchPattern(tst[1].src, tst[1].targ);
          } catch (error) {
            console.log('Exception Message:', error.message); // eslint-disable-line no-console
            return;
          }
        }
        expect(matchPattern.bind(null,tst[1].src, tst[1].targ)).to.throw();
        return;
      }
      var matchResult = matchPattern(tst[1].src, tst[1].targ);
      if (tst[0]) {
        return expect(matchResult).to.be.null;
      } else {
        // eslint-disable-next-line no-console
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
        [true,  {targ:{a: {b: 2}}, src: {a: {b: 2}}}],
        [false, {targ:{a: {b: 2}}, src: {a: {b: 3}}}],
        [false, {targ: {}, src: 5}],
        [false, {targ: {a: 1}, src: 5}],
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
        [true,  {targ:{a: 5, b: '_.isOmitted'}, src: {a: 5}}],
        [true,  {targ:{a: 5, b: undefined}, src: {a: 5}}],
        [true,  {targ: [1, 2, 3], src: [1, 2, 3]}],
        [false, {targ: [1, 2, 3], src: [1, 4, 3]}],
        [true,  {targ: '_.isUrl', src: 'https://my.testurl.com'}],
        [false, {targ: '_.isUrl', src: 'hbbp://my.testurl.com'}],
        [true,  {targ: '_.isInteger', src: 1}],
        [false, {targ: '_.isInteger', src: '1'}],
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
        [true,  {targ: '_.isNotInRange|3.1|7.7', src: 2}],
        [true,  {targ: '_.isContainerFor|king', src: 'rocking chair'}],
        [true,  {targ: '_.isContainerFor|4', src: [2, 3, 4, 5]}],
        [true,  {targ: '_.isContainerFor|abc', src: {abc: 1, def: 2}}],
        [true,  {targ: '_.isSize|3', src: [3, 2, 1]}],
        [true,  {targ: '_.isSize|4', src: {a: 1, b: 2, c: 3, d: 4}}],
        [true,  {targ: '_.isSize|5', src: 'abcde'}],
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
        [true,  {targ: { '<=' : _.isNumber}, src: [1, 2]}],
        [false,  {targ: { '<=' : _.isNumber}, src: [1, '2']}],
        [true,  {targ: { '<=.toString' : ['1', '2']}, src: [1, '2']}],
        [true,  {targ: { '<=.toString' : {a: '1', b: '2'}}, src: {a: 1, b: '2'}}]
      ]);
    });

    // ['every', 'filter', 'find', 'findLast', 'partition', 'reject', 'some']
    describe('apply lodash extension args', function () {
      runTestList([
        [true,  {targ: { '<-.every|a|1' : true},  src: [{a: 1, b: 2}, {a: 1, b: 3}]}],
        [true,  {targ: { '<-.every|b|2' : false}, src: [{a: 1, b: 2}, {a: 1, b: 3}]}],
        [true,  {targ: { '<-.filter|b|2' : [{a: 1, b: 2}]}, src: [{a: 1, b: 2}, {a: 1, b: 3}]}],
        [true,  {targ: { '<-.find|a|1' : {a: 1, b: 2}}, src: [{a: 1, b: 2}, {a: 1, b: 3}]}],
        [true,  {targ: { '<-.find|b|3' : {a: 1, b: 3}}, src: [{a: 1, b: 2}, {a: 1, b: 3}]}],
        [true,  {targ: { '<-.findLast|a|1' : {a: 1, b: 3}}, src: [{a: 1, b: 2}, {a: 1, b: 3}]}],
        [true,  {targ: { '<-.partition|b|3' : [[{a: 1, b: 3}], [{a: 1, b: 2}]]},
          src: [{a: 1, b: 2}, {a: 1, b: 3}]}],
        [true,  {targ: { '<-.reject|b|2' : [{a: 1, b: 3}]}, src: [{a: 1, b: 2}, {a: 1, b: 3}]}],
        [true,  {targ: { '<-.some|b|3' : true},  src: [{a: 1, b: 2}, {a: 1, b: 3}]}],
        [true,  {targ: { '<-.some|b|4' : false},  src: [{a: 1, b: 2}, {a: 1, b: 3}]}],
      ]);
    });

    describe('function matchers', function () {
      var match5 = function (val) { return val === 5; };
      runTestList([
        [true,  {targ: match5, src: 5}],
        [false, {targ: match5, src: 6}],
        [true,  {targ: {a: _.isNumber}, src: {a: 6}}],
        [false, {targ: {a: _.isNumber}, src: {a: '6'}}],
        [true,  {targ: _.isPrinted, src: {test_that_isPrinted: 'printed_this'}}],
        [true,  {targ: {'<-.filterPattern|"{a: 1, ...}"': [{a: 1, b: 2}]},
          src: [{a: 1, b: 2}, {a: 2, b: 3}]}],
        [false,  {targ: {'<-.filterPattern|"{a: 7, ...}"': [{a: 1, b: 2}]},
          src: [{a: 1, b: 2}, {a: 2, b: 3}]}],
        [true,  {targ: {'<-.filterPattern|"{a: _.isInRange|0|18, ...}"': [{a: 1, b: 2}]},
          src: [{a: 1, b: 2}, {a: 20, b: 3}]}],
      ]);
    });

    describe('regexp', function () {
      runTestList([
        [true,  {targ: {a: /abc/}, src: {a: 'abc'}}],
        [false, {targ: {a: /abc/}, src: {a: 'Abc'}}],
        [true,  {targ: /\:/, src: ':'}],
        [true,  {targ: /\t\"\n/, src: '\t"\n'}],
        [true,  {targ: String.raw`/a\wc/`, src: 'abc'}],
        [false, {targ: String.raw`/a\.c/`, src: 'abc'}],
        [true,  {targ: String.raw`/AbC/i`, src: 'abc'}],
        [false, {targ: String.raw`/a.c/`, src: 'a\nc'}],
        [false, {targ: String.raw`/^a$\n^c$/`, src: 'a\nc'}],
        [true,  {targ: String.raw`/^a$\n^c$/m`, src: 'a\nc'}],
      ]);
    });

    describe('memos', function () {
      runTestList([
        [true,   {targ: '{ <-.setMemo|myMemo: 243 }', src: 243}],
        [true,   {targ: '_.isEqualToMemo|myMemo', src: 243}],
        [false,  {targ: '_.isNotEqualToMemo|myMemo', src: 243}],
        [true,   {targ: '{ <-.getMemoHash: { myMemo: 243 } }', src: 243}],
        [true,   {targ: '{ <-.clearMemos: "whatevs" }', src: 'whatevs'}],
        [false,  {targ: '_.isEqualToMemo|myMemo', src: 243}],
      ]);
    });


    describe('object like entities', function () {
      var afunction = function () {};
      afunction.a = 2;
      var newfunction = new afunction();
      newfunction.a = 2;
      var objectLikeArray = {};
      objectLikeArray[0] = 2;
      runTestList([
        [true,  {targ: {a: 2}, src: afunction}],
        [true,  {targ: {a: 2}, src: newfunction}],
        [false, {targ: [2], src: objectLikeArray}],
      ]);
    });
  });

  describe('Pattern Notation', function () {
    describe('basic tests', function () {
      runTestList([
        [true,    {targ: '{a: _.isNumber}', src: {a: 6}}],
        [false,   {targ: '{a: _.isNumber}', src: {a: '6'}}],
        [false,   {targ: '{a: "_.isNumber"}', src: {a: 6}}],
        [true,    {targ: '{a: /abc/}', src: {a: 'abc'}}],
        [true,    {targ: '/[0-9]+/', src: '123'}],
        [false,   {targ: '/[A-Z]+/', src: '123'}],
        [true,    {targ: {text: /passwordToken=3\.[0-9a-f]{6}/, a: 1},
          src: {text: 'http://aurl.com?passwordToken=3.297e54', a: 1}} ],
        [true,    {targ: '{ <-.without|10: [9, 11]}', src: [9, 10, 11] }],
        [false,   {targ: '{ <-.without|"10": [9, 11]}', src: [9, 10, 11] }],
        [true,    {targ: '{ <-.without|"10": ["9", "11"]}', src: ['9', '10', '11'] }],
        [true,    {targ: '{ <-.without|"1 0": ["9", "11"]}', src: ['9', '1 0', '11'] }],
        ['throw', {targ: '{a: _.size}', src: {a: 6}}],
        [true,    {targ: `{
            <-.size: 3,
            <-.without|abc|def : ['efg']
          }`, src: ['abc', 'def', 'efg']} ],
        [true,    {targ: `{
            age: _.isBetween|20|30
            ...
          }`, src: {age: 25, name: 'bob'}} ]

      ]);
    });
  });
});

describe('#use (custom lodash module)', function () {
  beforeEach(function () {
    var lodashExt = _.runInContext();
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
    return expect(matchResult).to.be.null;
  });

  it('fails with non-matching test data', function () {
    var matchResult = matchPattern(this.winkie, '_.isSmilie');
    return expect(matchResult).to.be.a('string');
  });

  describe('pattern parsing error info', function () {
    it('visual check of chalk output', function () {
      var testStr = [
        '{',
        '  a 1',
        '  ...',
        '}'
      ].join('\n');
      try {
        matchPattern({a: 1}, testStr);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err.message);
      }

    });
  });
});
