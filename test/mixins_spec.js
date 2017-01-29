'use strict';

var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var rewire = require('rewire');
var mixins = rewire('../lib/mixins');

var sandbox = sinon.sandbox.create();

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

  describe('#isDefined', function () {
    it('succeeds for null value', function () {
      return expect(mixins.isDefined(null)).to.be.true;
    });
    it('fails for undefined value', function () {
      var a = {};
      return expect(mixins.isDefined(a.b)).to.be.false;
    });
  });

  describe('#isPrinted', function () {
    beforeEach(function () {
      this.consoleStub = sandbox.stub(console, 'log');
    });
    it('returns true', function () {
      return expect(mixins.isPrinted("'abc'")).to.be.true;
    });
    it('prints argument without a label', function () {
      mixins.isPrinted('abc');
      expect(this.consoleStub).to.be.calledWith('', "'abc'");
    });
    it('prints argument with a label', function () {
      mixins.isPrinted('abc', 'alabel');
      expect(this.consoleStub).to.be.calledWith('alabel', "'abc'");
    });
    it('prints a deep object', function () {
      mixins.isPrinted({a: {b: {c: {d: {e: 1}}}}});
      expect(this.consoleStub).to.be.calledWith('', '{ a: { b: { c: { d: { e: 1 } } } } }');
    });
  });

  describe('memos', function (){
    beforeEach(function () {
      this.memo = mixins.__get__('memo');
      this.memo.hash = {};
    });
    describe('#clearMemos', function () {
      it('clears', function () {
        this.memo.hash.someKey = 'someValue';
        mixins.clearMemos();
        return expect(this.memo.hash).to.be.empty;
      });
    });
    describe('#getMemoHash', function () {
      it('gets', function () {
        this.memo.hash.someKey = 'someValue';
        return expect(mixins.getMemoHash()).to.deep.equal({someKey: 'someValue'});
      });
    });

    describe('#setMemo', function () {
      it('sets', function () {
        this.memo.hash.someKey = 'someValue';
        expect(mixins.setMemo(57, 'abc')).to.equal(57);
        return expect(this.memo.hash.abc).to.equal(57);
      });
    });
    describe('#isSetAsMemo', function () {
      it('sets', function () {
        this.memo.hash.someKey = 'someValue';
        expect(mixins.isSetAsMemo(57, 'abc')).to.equal(true);
        return expect(this.memo.hash.abc).to.equal(57);
      });
    });
    describe('#isEqualToMemo', function () {
      it('tests memo', function () {
        this.memo.hash.someKey = 'someValue';
        return expect(mixins.isEqualToMemo('someValue', 'someKey')).to.be.true;
      });
    });

    describe('#isNotEqualToMemo', function () {
      it('tests not memo', function () {
        this.memo.hash.someKey = 'someValue';
        return expect(mixins.isNotEqualToMemo('someValue', 'someKey')).to.be.false;
      });
    });
  });

  describe('filters', function () {

    describe('#filterPattern', function () {
      it('filters based on a pattern', function () {
        expect(mixins.filterPattern([{a: 1, b: 2}, {a: 2, b: 3}],'{a: 1, ...}'))
          .to.deep.equal([{a: 1, b: 2}]);
      });
    });


    describe('#extractUrls', function () {
      it('extracts from a multi line string', function () {
        var extracted = mixins.extractUrls([
          'Whatever http://google.com',
          'https://whatever.blah.co?param=123',
        ].join('\n'));
        expect(extracted[0].host).to.equal('google.com');
        expect(extracted[1].host).to.equal('whatever.blah.co');
        expect(extracted[1].query).to.deep.equal({ param: '123' });
      });

      it('extracts from HTML with encoded chars', function () {
        var extracted = mixins.extractUrls([
          '<p> my link',
          '  <a href="http://blah.com?token&#x3D;2.6">click me</a>',
          '</p>'
        ].join('\n'));
        expect(extracted[0].query).to.deep.equal({token: '2.6'});
      });

      it('extracts a variety of url patterns', function () {
        var extracted = mixins.extractUrls([
          'www.blah.com',
          'blah.org/something',
          'http://foo.com/more_(than)_one_(parens)',
          'http://foo.com/blah_(wikipedia)#cite-1',
          'http://foo.com/blah_(wikipedia)_blah#cite-1',
          'http://foo.com/unicode_(✪)_in_parens',
          'http://foo.com/(something)?after=parens',
        ].join('\n'));
        expect(extracted.length).to.equal(7);
      });
    });
  });

  describe('parameter extensions for lodash', function () {
    var users = [
      { 'user': 'barney', 'age': 36, 'active': false },
      { 'user': 'fred',   'age': 40, 'active': false }
    ];
    describe('#every', function () {
      it('allows for third argument to match', function () {
        expect(mixins.every(users, 'active', false)).to.equal(true);
        expect(mixins.every(users, 'age', 40)).to.equal(false);
      });
    });
  });
});
