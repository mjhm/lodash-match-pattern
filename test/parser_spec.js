'use strict';

var chai = require('chai');
var util = require('util');
var fs = require('fs');
var PEG = require('pegjs');
var expect = chai.expect;

var parser = PEG.buildParser(fs.readFileSync('./parser/matchpattern.pegjs', 'utf8'));

var parserTests =[
  [ '{"a": 1}', {a: 1} ],
  [ "{'a': 1}", {a: 1} ],
  [ "{a: '1'}", {a: '1'} ],
  [ '{a : 1}',  {a: 1} ],
  [ '{a : 1, ...}', {a: 1, '__MP_subset': ''} ],
  [ '[1, 2, ...]',  [1, 2, '__MP_subset'] ],
  [ '[1, 2, ^^^]',  [1, 2, '__MP_superset'] ],
  [ '[1, 2, ===]',  [1, 2, '__MP_equalset'] ],
  [ '{<= : {a : 1}}',  {'__MP_map0': {a: 1}} ],
  [ '{<= : {a : 1}, <= : {b : 2}}',  {'__MP_map0': {a: 1}, '__MP_map1': {b: 2}} ],
  [ '{<- : {a : 1}}',  {'__MP_apply0': {a: 1}} ],
  [ '{<=.mapme : {a : 1}}',  {'__MP_map0 mapme': {a: 1}} ],
  [ '{<-.applyme : {a : 1}}',  {'__MP_apply0 applyme': {a: 1}} ],
  [ '{<-.applyme|abc : {a : 1}}',  {'__MP_apply0 applyme|abc': {a: 1}} ],
  [ '{<-.applyme|abc: {a : 1}}',  {'__MP_apply0 applyme|abc': {a: 1}} ],
  [ '{<-.applyme|abc|"-34.9": {a : 1}}',  {'__MP_apply0 applyme|abc|"-34.9"': {a: 1}} ],
  [ '{a : _.isMatchMe}',  {a: "__MP_match isMatchMe"} ],
];

describe('parser', function () {
  parserTests.forEach(function(tst) {
    var desc = util.inspect(tst[0], {depth: 3}) + ' parses into \n' + JSON.stringify(tst[1], null, 2);

    it(desc, function() {
      expect(parser.parse(tst[0])).to.deep.equal(tst[1]);
    });

  });
});
