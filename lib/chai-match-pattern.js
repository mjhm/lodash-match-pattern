'use strict';

var matchPattern = require('./match-pattern');

module.exports = (_chai, utils) => {
  let Assertion = _chai.Assertion;

  function assertMatchPattern(pattern) {
    var obj = this._obj;
    var check = matchPattern(pattern, obj);

    this.assert(
      !check,
      check,
      'expected #{this} to not match the given pattern',
      obj
    );
  }

  Assertion.addMethod('matchPattern', assertMatchPattern);
};
