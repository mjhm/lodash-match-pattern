Feature: Memoization Functionality

  Background:
    Given I have a basic user

  Scenario: Dupicating a user updates id and createDate but copies email and tvshows
    When the user matches the pattern
      """
      {
        id: {<-.setMemo|id: _.isInteger},
        email: _.isSetAsMemo|email,
        createDate: _.isSetAsMemo|createDate,
        tvshows: _.isSetAsMemo|tvshows,
        ...
      }
      """
    And the user is duplicated
    Then the duplicate user matches the pattern
      """
      {
        id: _.isNotEqualToMemo|id,
        email: _.isEqualToMemo|email,
        createDate: _.isNotEqualToMemo|createDate,
        tvshows: _.isEqualToMemo|tvshows,
        ...
      }
      """
