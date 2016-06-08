Feature: Transform Functionality

  Background:
    Given I have a basic user

  Scenario: Unsorted arrays via equalset or transform function.
    Then the user matches the pattern
    """
    {
      friends: {
        <-.sortBy|email: [
          {id: 21, email: 'bob@mp.co', active: true},
          {id: 14, email: 'dan@mp.co', active: true},
          {id: 89, email: 'jerry@mp.co', active: false}
        ]
      },
      ...
    }
    """

Scenario: Map transform checks the email addresses of the friends list
  Then the user matches the pattern
    """
    {
      friends: {
        <=: { email: /@mp.co$/, ...}
      },
      ...
    }
    """

Scenario: Email addresses of the friends list contained in a whitelist
  Then the user matches the pattern
    """
    {
      friends: {
        <=.get|email: {
          <=.toLower: [
            'bob@mp.co',
            'jerry@mp.co',
            'dan@mp.co',
            'paul@mp.co',
            ^^^
          ]
        }
      },
      ...
    }
    """

Scenario: Composition
  Then the user matches the pattern
    """
    {
      friends: {
        <-.filter|active: {
          <-.size: 2,
          <-: _.isSize|2,
          <-.isSize|2: true
        },
        <=.get|active: {
          <=.toNumber: {
            <-.sum: 2
          }
        }
      },
      ...
    }
    """

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
