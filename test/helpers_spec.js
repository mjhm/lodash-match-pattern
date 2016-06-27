
'use strict';

var chai = require('chai');
var expect = chai.expect;

var helpers = require('../lib/helpers');

var fillSrcWithVoids = helpers.fillSrcWithVoids;
var fillTargWithVoids = helpers.fillTargWithVoids;

describe('helpers', function () {
  describe('fillSrcWithVoids', function () {
    var fillSrcTests = [
      '{targ: {a: 2, b: 2}, src: {a: 1}, result: {a: 1, b: undefined}}',
      '{targ: {a: 2, b: 2}, src: {a: 1, c: 1}, result: {a: 1, c: 1, b: undefined}}',
      '{targ: {a: 2, b: 2, "__MP_subset": ""}, src: {a: 1, c: 1}, result: {a: 1, b: undefined}}'
    ];
    fillSrcTests.forEach(function (test) {
      var testData = new Function('return ' + test)();
      it(test, function () {
        var filled = fillSrcWithVoids(testData.targ, testData.src);
        expect(filled).to.deep.equal(testData.result);
      });
    });
  });

  describe('fillTargWithVoids', function () {
    var fillTargTests = [
      '{targ: {a: 2, b: 2}, src: {a: 1}, result: {a: 2, b: 2}}',
      '{targ: {a: 2, b: 2}, src: {a: 1, c: 1}, result: {a: 2, c: undefined, b: 2}}',
      '{targ: {a: 2, b: 2, "__MP_subset": ""}, src: {a: 1, c: 1}, result: {a: 2, b: 2, c: undefined}}'
    ];
    fillTargTests.forEach(function (test) {
      var testData = new Function('return ' + test)();

      it(test, function () {
        var filled = fillTargWithVoids(testData.targ, testData.src);
        expect(filled).to.deep.equal(testData.result);
      });
    });
  });
});
