Feature: Customization Functionality

  Background:
    Given I have a basic user

  Scenario: Use custom _.isActiveSize function
    Then the user matches the pattern
    """
      {
        friends: _.isActiveSize|2,
        ...
      }
    """


  Scenario: Use custom _.literalSetToken transform to check for "===", "^^^", and "^^^" in array
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
