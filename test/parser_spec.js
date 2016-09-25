'use strict';

var chai = require('chai');
var util = require('util');
var fs = require('fs');
var peg = require('pegjs');
var Tracer = require('pegjs-backtrace');
var expect = chai.expect;

var only = 'only';

var parser = peg.generate(fs.readFileSync('./parser/matchpattern.pegjs', 'utf8'), {trace: true} );

var parserTests =[
];


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
    // var desc = tst[0].split('').join(',') + ' parses into \n' + JSON.stringify(tst[1], null, 2);

    it(desc, function() {
      var tracer = new Tracer(tst[0], {showTrace:false});
      try {
        var parsed = parser.parse(tst[0], {tracer: tracer});
      } catch(e) {
          console.log(e.message);
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
      [ '{a : _.isMatchMe}',  {a: "__MP_match isMatchMe"} ],
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
      [ '{a : /abc/}',  {a: '__MP_regex abc'} ],
      [ '/abc/', '__MP_regex abc' ],
      [ '/[A-Z].*/', '__MP_regex [A-Z].*'],
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
