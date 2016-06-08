'use strict';

var chai = require('chai');
var util = require('util');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var _ = require('lodash-checkit');
var expect = chai.expect;

var rewire = require('rewire');
var mixins = rewire('../lib/mixins');

var sandbox = sinon.sandbox.create()

describe('mixins', function () {

  afterEach(function () {
    sandbox.restore();
  });
  describe('#isDateString', function () {
    it('parses iso date string', function () {
      return expect(mixins.isDateString('2016-05-22T00:23:23.343Z')).to.be.true;
    });
    it('fails parsing "0" as a date string', function () {
      return expect(mixins.isDateString(0)).to.be.false;
    });
  });

  describe('#isSize', function () {
    it('checks size of array', function () {
      return expect(mixins.isSize([1, 2, 3], 3)).to.be.true;
    });
    it('fails for wrong size of array', function () {
      return expect(mixins.isSize([1, 2, 3], 4)).to.be.false;
    });
  });

  describe('#isOmitted', function () {
    it('succeeds if object property is missing', function () {
      var a = {};
      return expect(mixins.isOmitted(a.b)).to.be.true;
    });
    it('fails if object property exists', function () {
      var a = {b: 1};
      return expect(mixins.isOmitted(a.b)).to.be.false;
    });
  });

  describe('#isPrinted', function () {
    beforeEach(function () {
      this.consoleStub = sandbox.stub(console, 'log')
    });
    it('returns true', function () {
      return expect(mixins.isPrinted('abc')).to.be.true;
    });
    it('prints argument without a label', function () {
      mixins.isPrinted('abc')
      expect(this.consoleStub).to.be.calledWith('', 'abc');
    });
    it('prints argument with a label', function () {
      mixins.isPrinted('abc', 'alabel')
      expect(this.consoleStub).to.be.calledWith('alabel', 'abc');
    });
  });

  describe('#filterPattern', function () {
    it('filters based on a pattern', function () {
      expect(mixins.filterPattern([{a: 1, b: 2}, {a: 2, b: 3}],'{a: 1, ...}'))
        .to.deep.equal([{a: 1, b: 2}])
    });
  });

  describe('memos', function (){
    beforeEach(function () {
      this.memo = mixins.__get__('memo');
      this.memo.hash = {};
    });
    describe('#clearMemos', function () {
      it('clears', function () {
        this.memo.hash.someKey = 'someValue'
        mixins.clearMemos()
        return expect(this.memo.hash).to.be.empty;
      });
    });
    describe('#getMemoHash', function () {
      it('gets', function () {
        this.memo.hash.someKey = 'someValue'
        return expect(mixins.getMemoHash()).to.deep.equal({someKey: 'someValue'});
      });
    });

    describe('#setMemo', function () {
      it('sets', function () {
        this.memo.hash.someKey = 'someValue'
        expect(mixins.setMemo(57, 'abc')).to.equal(57);
        return expect(this.memo.hash.abc).to.equal(57);
      });
    });
    describe('#isSetAsMemo', function () {
      it('sets', function () {
        this.memo.hash.someKey = 'someValue'
        expect(mixins.isSetAsMemo(57, 'abc')).to.equal(true);
        return expect(this.memo.hash.abc).to.equal(57);
      });
    });
    describe('#isEqualToMemo', function () {
      it('tests memo', function () {
        this.memo.hash.someKey = 'someValue'
        return expect(mixins.isEqualToMemo('someValue', 'someKey')).to.be.true;
      });
    });

    describe('#isNotEqualToMemo', function () {
      it('tests not memo', function () {
        this.memo.hash.someKey = 'someValue'
        return expect(mixins.isNotEqualToMemo('someValue', 'someKey')).to.be.false;
      });
    });
  });

});
