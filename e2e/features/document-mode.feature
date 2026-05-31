Feature: Document Mode browser behavior
  Background:
    Given the mobile install choice is dismissed

  Scenario: Reader Appearance works across desktop and mobile widths
    Given I am reading an Intro Chapter
    When I set the viewport to desktop width
    And I open Reader Appearance
    Then the Readerly font option is selected
    When I choose the Reader Appearance font "NV Garamond"
    And I increase the Reader Appearance font size
    Then Reader Appearance shows "15 pt"
    And the "NV Garamond" font option is selected
    And the selected Reader Appearance is remembered by this browser
    And the Chapter Document uses the "NV Garamond" font
    And the Reader Appearance panel is inside the viewport
    When I set the viewport to mobile width
    Then the Reader Appearance panel is inside the viewport

  Scenario: Chapter authoring uses the page as the scroll container
    Given I am creating an Intro Chapter for a Story
    When I set the viewport to desktop width
    And I fill the Chapter title
    And I fill the Chapter content with 80 paragraphs
    Then the Chapter Document has no inner scroll container
    And the page can scroll
    When I scroll to the bottom of the page
    Then the Chapter title has scrolled out of view
    When I save the Chapter and reopen it for editing
    Then the Chapter content is preserved
    And the Chapter Document has no inner scroll container
    And the page can scroll

  Scenario: Typing near the bottom keeps my writing position stable
    Given I am creating an Intro Chapter for a Story
    When I fill the Chapter title
    And I fill the Chapter content with 120 paragraphs
    And I move my writing position to the bottom
    And I type near the bottom
    Then my writing position stays stable
