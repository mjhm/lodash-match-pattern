'use strict';

var chai = require('chai');
var fs = require('fs');
var peg = require('pegjs');
var Tracer = require('pegjs-backtrace');
var expect = chai.expect;

var only = 'only'; // eslint-disable-line no-unused-vars

var parser = peg.generate(fs.readFileSync('./parser/matchpattern.pegjs', 'utf8'), {trace: true} );

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
    var desc = tst[0] + ' parses into \n' + JSON.stringify(tst[1], null, 2);

    it(desc, function() {
      var tracer = new Tracer(tst[0], {
        showTrace:false,
        showFullPath:false,
      });
      try {
        var parsed = parser.parse(tst[0], {tracer: tracer});
      } catch(e) {
        // eslint-disable-next-line no-console
        console.log(e.message);
        // eslint-disable-next-line no-console
        console.log(tracer.getBacktraceString());
        throw e;
      }
      expect(parsed).to.deep.equal(tst[1]);
    });
  });
};



describe('parser', function () {
  describe('basic tests', function () {
    runTestList([
      [ '{"a": 1}', {a: 1} ],
      [ "{'a': 1}", {a: 1} ],
      [ "{a: '1'}", {a: '1'} ],
      [ '{a : 1}',  {a: 1} ],
    ]);
  });
  describe('sets', function () {
    runTestList([
      [ '{a : 1, ...}', {a: 1, '__MP_subset': ''} ],
      [ '{a : 1 ...}',  {a: 1, '__MP_subset': ''} ],
      [ '[1, 2, ...]',  [1, 2, '__MP_subset'] ],
      [ '[1, 2, ^^^]',  [1, 2, '__MP_superset'] ],
      [ '[1, 2, ===]',  [1, 2, '__MP_equalset'] ],
    ]);
  });
  describe('map / apply', function () {
    runTestList([
      [ '{<= : {a : 1}}',  {'__MP_map0': {a: 1}} ],
      [ '{<= : {a : 1}, <= : {b : 2}}',  {'__MP_map0': {a: 1}, '__MP_map1': {b: 2}} ],
      [ '{<- : {a : 1}}',  {'__MP_apply0': {a: 1}} ],
      [ '{<=.mapme : {a : 1}}',  {'__MP_map0 mapme': {a: 1}} ],
      [ '{<-.applyme : {a : 1}}',  {'__MP_apply0 applyme': {a: 1}} ],
      [ '{a : _.isMatchMe}',  {a: '__MP_match isMatchMe'} ],
      [ '{a : _.hasMatchMe}',  {a: '__MP_match hasMatchMe'} ],
    ]);
  });
  describe('arg parsing', function () {
    runTestList([
      [ '{<-.applyme|abc : {a : 1}}',  {'__MP_apply0 applyme|abc': {a: 1}} ],
      [ '{<-.applyme|abc: {a : 1}}',  {'__MP_apply0 applyme|abc': {a: 1}} ],
      [ '{<-.applyme|abc|"-34.9": {a : 1}}',  {'__MP_apply0 applyme|abc|"-34.9"': {a: 1}} ],
      [ '{<-.applyme|"a b": {a : 1}}',  {'__MP_apply0 applyme|"a b"': {a: 1}} ],
      [ '{a : _.isMatchMe|"a b"}',  {a: '__MP_match isMatchMe|"a b"'} ],
    ]);
  });
  describe('regex', function () {
    runTestList([
      [ '{a : /abc/}',  {a: '__MP_regex() abc'} ],
      [ '/abc/', '__MP_regex() abc' ],
      [ '/[A-Z].*/', '__MP_regex() [A-Z].*'],
      [ String.raw`/[A-Z].*/`, String.raw`__MP_regex() [A-Z].*`],
      [ String.raw`/a\w.*/`, String.raw`__MP_regex() a\w.*`],
      [ String.raw`/a\/.*/`, String.raw`__MP_regex() a\/.*`],
      [ String.raw`/a\/.*/igmyu`, String.raw`__MP_regex(igmyu) a\/.*`],
    ]);
  });
  describe('recursive filterPattern', function () {
    runTestList([
      [ '{<-.filterPattern|"{b: 2}": 1}',  {'__MP_apply0 filterPattern|"{b: 2}"': 1} ],
      [ '{<-.filterPattern|"{b: \'2\'}": 1}',  {'__MP_apply0 filterPattern|"{b: \'2\'}"': 1} ],
      [ '{<-.filterPattern|"{b: \'2\', ...}": 1}',  {'__MP_apply0 filterPattern|"{b: \'2\', ...}"': 1} ],
      [ '{<-.filterPattern|"{b: _.isInRange|2|4}": 1}',  {'__MP_apply0 filterPattern|"{b: _.isInRange|2|4}"': 1} ],
      [ '{<-.filterPattern|"{b: _.isInRange|0|18, ...}": 1}',  {'__MP_apply0 filterPattern|"{b: _.isInRange|0|18, ...}"': 1} ],
    ]);
  });
  describe('comments', function () {
    runTestList([
      [ '{"a": 1}# abc##', {a: 1} ],
      [ '', '' ],
      [ '{a: 1,\n#b: 2\n}', {a: 1} ],
      [ '{a: "#1"}', {a: '#1'} ],
    ]);
  });

});
