# TreeTales Context

TreeTales is a branching story writing and reading app. This context names the story structure users create and navigate.

## Language

**Story**:
A user-authored branching narrative.
_Avoid_: Book, tale, project

**Chapter**:
A single authored passage within a **Story**.
_Avoid_: Node, page, scene

**Parent Chapter**:
The **Chapter** from which a **Branch** is reached.
_Avoid_: Previous chapter

**Intro Chapter**:
The first **Chapter** in a **Story**, with no parent chapter.
_Avoid_: Root node, start page

**Branch**:
A **Chapter** reached from another **Chapter**.
_Avoid_: Child Chapter, child node, branch target

**Reader Appearance**:
A user's presentation preferences for **Chapter** document text.
_Avoid_: Style, configuration

## Relationships

- A **Story** has zero or more **Chapters**.
- A **Chapter** belongs to exactly one **Story**.
- A **Story** has zero or one **Intro Chapter**.
- A **Chapter** has zero or one parent **Chapter**.
- A **Chapter** can have zero or more **Branches**.
- **Chapters** in the same **Story** cannot form cycles.

## Example dialogue

> **Dev:** "When a reader opens a **Story**, should they start at any chapter?"
> **Domain expert:** "No. They start at the **Intro Chapter**, then choose among its **Branches** as the story unfolds."

## Flagged ambiguities

- "node" can describe the technical graph representation, but product language should use **Chapter**.
- "child chapter" describes the technical parent-child relationship, but product language should use **Branch**.
- "previous chapter" can imply browser or reader history — resolved: use **Parent Chapter** for structural navigation.
- "style" and "configuration" can imply broad editor or app settings — resolved: use **Reader Appearance** for **Chapter** document text presentation preferences.
- "Reader Appearance" was originally reading-only — resolved: it can also apply to chapter authoring surfaces when those surfaces present **Chapter** document text.
