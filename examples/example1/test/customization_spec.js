
var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
var expect = chai.expect;

var JoeUser = require('../index');


_.mixin({
  literalSetToken: function (elem) {
    if (elem === '...') return 'LITERAL...';
    if (elem === '^^^') return 'LITERAL^^^';
    if (elem === '===') return 'LITERAL===';
    return elem;
  },

  isActiveSize: function (array, size) {
    if (! _.isArray(array)) return false;
    var activeSize = _.size(_.filter(array, 'active'));
    return activeSize === size;
  }
});


describe('Customized matchers for lodash-match-pattern', function () {
  beforeEach(function () {
    this.user = (new JoeUser()).user;
  });

  describe('using custom lodash function _.isActiveState', function () {
    it('matches the the active friends count', function () {
      expect(this.user).to.matchPattern({
        friends: '_.isActiveSize|2',
        '...': ''
      });
    });
  });

  describe('using custom lodash transform _.literalSetToken', function () {
    beforeEach(function () {
      this.user.tvshows = [
        "===",
        "Mannix",
        "Game of Thrones",
        "...",
        "^^^"
      ];
    });

    it('matches literal  "===", "^^^", and "^^^"', function () {
      expect(this.user).to.matchPattern({
        tvshows: {
          '<=.literalSetToken': [
            'LITERAL===',
            'Mannix',
            'Game of Thrones',
            'LITERAL...',
            'LITERAL^^^'
          ]
        },
        '...': ''
      });
    });
  });
});
