'use strict';

var chai = require('chai');
var util = require('util');
var expect = chai.expect;
var normalize = require('../normalize');

var dummyFn = function () {};

var normalizeTests = [
  [ {'<-': 1}, {'__MP_apply': 1} ],
  [ {a: {'<-': 1}}, {a: {'__MP_apply': 1}} ],
  [ [{'<=': 1, '...': 'abc'}], [{'__MP_map': 1, '__MP_subset': ''}] ],
  [ {'<-.myapply': '_.isAtest|with|arg|1'}, {'__MP_apply myapply': '__MP_match isAtest|with|arg|1'}],
  [ {'<-.myapply|arg': 'abc'}, {'__MP_apply myapply|arg': 'abc'}],
  [ ['_.isString'], ['__MP_match isString'] ],
  [ 5, 5 ],
  [ [ dummyFn ], [ dummyFn ] ],
  [ [ dummyFn, '==='], [ dummyFn, '__MP_equalset' ] ]
];

describe('normalize', function () {
  normalizeTests.forEach(function(tst) {
    var desc = util.inspect(tst[0], {depth: 3}) + ' normalizes into ' + util.inspect(tst[1], {depth: 3});

    it(desc, function() {
      expect(normalize(tst[0])).to.deep.equal(tst[1]);
    });

  });
});
