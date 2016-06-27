var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
var expect = chai.expect;

var JoeUser = require('../index');

describe('Using transforms in lodash-match-pattern', function () {
  beforeEach(function () {
    this.user = (new JoeUser()).user;
  });

  describe('_.sortBy transform', function () {
    it('matches the unsorted friends array', function () {
      expect(this.user).to.matchPattern({
        friends: {
          '<-.sortBy|email': [
            {id: 89, email: 'gerri@mp.co', active: false},
            {id: 14, email: 'kim@mp.co', active: true},
            {id: 21, email: 'pat@mp.co', active: true}
          ]
        },
        '...': ''
      });
    });
  });

  describe('<= (map) transform', function () {
    it('allows for a check that the email addresses are all from the "mp.co" domain', function () {
      expect(this.user).to.matchPattern({
        friends: {
          '<=': {
            email: /@mp.co$/,
            '...': ''
          }
        },
        '...': ''
      });
    });
  });

  describe('mapping transform composition with _.get and _.toLower', function () {
    it('checks that all addresses from the friends list are contained in a whitelist', function () {
      expect(this.user).to.matchPattern({
        friends: {
          '<=.get|email': { // pulls the emails out of friends
            '<=.toLower': [ // maps all the emails to lower case
              'pat@mp.co',
              'gerri@mp.co',
              'kim@mp.co',
              'paula@mp.co',
              '^^^'         // superset match (source array is included in this target array)
            ]
          }
        },
        '...': ''
      });
    });
  });

  describe('transform composition examples', function () {
    it('checks size of the filtered friends list in 4 different ways', function () {
      expect(this.user).to.matchPattern({
        friends: {
          '<-.filter|active': {
            '<-.size': 2,
            '<-': '_.isSize|2',
            '<-.isSize|2': true
          },
          '<=.get|active': {
            '<=.toNumber': {
              '<-.sum': 2
            }
          }
        },
        '...': ''
      });
    });
  });
});
