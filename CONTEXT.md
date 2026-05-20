# TreeTales Context

TreeTales is a branching story writing and reading app. This context names the story structure users create and navigate.

## Language

**Story**:
A user-authored branching narrative.
_Avoid_: Book, tale, project

**Character**:
A person-like entity in a **Story**.
_Avoid_: Cast member, persona

**Character Gender**:
A required **Character** classification of either male or female.
_Avoid_: Sex, pronouns, free-form gender

**Character Property**:
An ordered key/value detail on a **Character**, such as age, appearance, or description.
_Avoid_: Attribute, field, metadata

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

**Prompt Builder**:
An authoring aid that turns a rough **Chapter** plot and available **Chapter** context into a reusable LLM prompt.
_Avoid_: AI writer, generate chapter

**Rough Plot**:
A scratch outline of intended **Chapter** beats that can feed the **Prompt Builder**.
_Avoid_: Draft, chapter content

## Relationships

- A **Story** has zero or more **Chapters**.
- A **Story** has zero or more **Characters**.
- A **Character** belongs to exactly one **Story**.
- A **Character** has zero or more **Character Properties**.
- A **Character Property** belongs to exactly one **Character**.
- A **Chapter** belongs to exactly one **Story**.
- A **Story** has zero or one **Intro Chapter**.
- A **Chapter** has zero or one parent **Chapter**.
- A **Chapter** can have zero or more **Branches**.
- **Chapters** in the same **Story** cannot form cycles.

## Example dialogue

> **Dev:** "When a reader opens a **Story**, should they start at any chapter?"
> **Domain expert:** "No. They start at the **Intro Chapter**, then choose among its **Branches** as the story unfolds."
>
> **Dev:** "If the same **Character** appears across several **Branches**, should we create one per **Chapter**?"
> **Domain expert:** "No. A **Character** belongs to the **Story**, even if they appear in many **Chapters**."

## Flagged ambiguities

- "node" can describe the technical graph representation, but product language should use **Chapter**.
- "child chapter" describes the technical parent-child relationship, but product language should use **Branch**.
- "previous chapter" can imply browser or reader history — resolved: use **Parent Chapter** for structural navigation.
- "style" and "configuration" can imply broad editor or app settings — resolved: use **Reader Appearance** for **Chapter** document text presentation preferences.
- "Reader Appearance" was originally reading-only — resolved: it can also apply to chapter authoring surfaces when those surfaces present **Chapter** document text.
- "generate prompt" can sound like direct prose generation — resolved: use **Prompt Builder** for preparing copy-paste LLM prompts, not writing chapter content inside TreeTales.
- "draft" can mean saved **Chapter** content or temporary scratch input — resolved: use **Rough Plot** for Prompt Builder scratch text and **Chapter** content for authored markdown.
- "character" could mean a chapter-local appearance or a story-level entity — resolved: use **Character** for a story-level entity that can appear across many **Chapters**.
