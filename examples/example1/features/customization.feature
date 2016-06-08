Feature: Customization Functionality

  Background:
    Given I have a basic user

  Scenario: Use custom isActiveSize function
    Then the user matches the pattern
    """
      {
        friends: _.isActiveSize|2,
        ...
      }
    """


  Scenario: Allow literal set tokens in test values
    Given I change tvshows to
      """
      [
        "===",
        "Mannix",
        "Game of Thrones",
        "...",
        "^^^"
      ]
      """
    Then the user matches the pattern
      """
      {
        tvshows: {
          <=.literalSetToken: [
            'LITERAL===',
            'Mannix',
            'Game of Thrones',
            'LITERAL...',
            'LITERAL^^^'
          ]
        },
        ...
      }
      """
