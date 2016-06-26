
var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
var expect = chai.expect;

var JoeUser = require('../index');

describe('Basic Features for lodash-match-pattern', function () {
  beforeEach(function () {
    this.user = (new JoeUser()).user;
  });

  describe('JoeUser object', function () {
    it('deep matches an explicit object', function () {
      expect(this.user).to.matchPattern({
        id: 43,
        email: 'joe@matchapattern.org',
        website: 'http://matchapattern.org',
        firstName: 'Joe',
        lastName: 'Matcher',
        phone: '(333) 444-5555',
        createDate: '2016-05-22T00:23:23.343Z',
        tvshows: [
          'Match Game',
          'Sopranos',
          'House of Cards'
        ],
        mother: {
          id: 23,
          email: 'mom@aol.com'
        },
        friends: [
          {id: 21, email: 'pat@mp.co', active: true},
          {id: 89, email: 'gerri@mp.co', active: false},
          {id: 14, email: 'kim@mp.co', active: true}
        ]
      });
    });

    it('matches its property types', function () {
      expect(this.user).to.matchPattern({
        id: _.isInteger,
        email: _.isEmail,
        website: _.isUrl,
        firstName: /[A-Z]\w+/,
        lastName: /[a-z]/i,
        phone: /\(\d{3}\)\s*\d{3}[- ]\d{4}/,
        createDate: _.isDateString,
        tvshows: [
          _.isString,
          _.isString,
          _.isString
        ],
        mother: _.isObject,
        friends: _.isArray
      });
    });

    it('matches a partial pattern', function () {
      this.user.email = 'billyjoe@duckduck.go';
      expect(this.user).to.matchPattern({
        id: _.isInteger,
        email: 'billyjoe@duckduck.go',
        '...': ''
      });
    });

    it('matches a partial array', function () {
      expect(this.user).to.matchPattern({
        tvshows: [
          'House of Cards',
          'Sopranos',
          '...'
        ],
        '...': ''
      });
    });

    it('matches a superset array', function () {
      expect(this.user).to.matchPattern({
        tvshows: [
          'House of Cards',
          'Match Game',
          'Sopranos',
          "Grey's Anatomy",
          '^^^'
        ],
        '...': ''
      });
    });

    it('matches an omitted property', function () {
      expect(this.user).to.matchPattern({
        id: 43,
        password: _.isOmitted,
        '...': ''
      });
    });

    it('matches functions with parameters', function () {

      // Using Pattern Notation for the matching functions
      expect(this.user).to.matchPattern({
        id: '_.isBetween|42.9|43.1',
        tvshows: "_.isContainerFor|'House of Cards'",
        '...': ''
      });

      // Using functions directly.
      expect(this.user).to.matchPattern({
        id: _.partial(_.isBetween, _, 42.9, 43.1),
        tvshows: _.partial(_.isContainerFor, _, 'House of Cards'),
        '...': ''
      });

      // Using pattern notation for the whole object
      expect(this.user).to.matchPattern(
        `{
          id: _.isBetween|42.9|43.1,
          tvshows: _.isContainerFor|'House of Cards'
          ...
        }`
      );
    });
  });
});
