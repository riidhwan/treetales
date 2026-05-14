# TreeTales Context

TreeTales is a branching story writing and reading app. This context names the story structure users create and navigate.

## Language

**Story**:
A user-authored branching narrative.
_Avoid_: Book, tale, project

**Chapter**:
A single authored passage within a **Story**.
_Avoid_: Node, page, scene

**Intro Chapter**:
The first **Chapter** in a **Story**, with no parent chapter.
_Avoid_: Root node, start page

**Child Chapter**:
A **Chapter** reached from another **Chapter**.
_Avoid_: Child node, branch target

## Relationships

- A **Story** has zero or more **Chapters**.
- A **Chapter** belongs to exactly one **Story**.
- A **Story** has zero or one **Intro Chapter**.
- A **Chapter** has zero or one parent **Chapter**.
- A **Chapter** can have zero or more **Child Chapters**.
- **Chapters** in the same **Story** cannot form cycles.

## Example dialogue

> **Dev:** "When a reader opens a **Story**, should they start at any chapter?"
> **Domain expert:** "No. They start at the **Intro Chapter**, then choose among its **Child Chapters** as the story branches."

## Flagged ambiguities

- "node" can describe the technical graph representation, but product language should use **Chapter**.
