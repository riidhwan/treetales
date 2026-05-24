# TreeTales Context

TreeTales is a branching story writing and reading app. This context names the story structure users create and navigate.

## Language

**Story**:
A branching narrative in TreeTales.
_Avoid_: Book, tale, project, CYOA

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

**Chapter Document**:
The readable or editable presentation of a **Chapter**'s title and content.
_Avoid_: Page, editor body, reading pane

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

**Built-in Example Story**:
A TreeTales-provided branching narrative that can become a local **Story** when the user chooses it.
_Avoid_: Demo story, sample project, CYOA, empty-state example

**Saved Story**:
A **Story** stored in the user's local library.
_Avoid_: Local project, user story, persisted example

**Example Story Copy**:
A **Saved Story** created from a **Built-in Example Story**.
_Avoid_: Read-only example, imported example, template instance

**Starter Section**:
The Library Mode area that presents **Built-in Example Stories** separately from **Saved Stories**.
_Avoid_: Example list, template gallery, saved examples

**Source Work**:
A U.S. public-domain work that informs a TreeTales-authored **Built-in Example Story**.
_Avoid_: Copied story, imported book, Creative Commons work

**Story Provenance**:
A short explanation of the **Source Work** basis for a **Built-in Example Story**.
_Avoid_: Citation, license note, attribution block

**Library Mode**:
The collection-oriented experience where a user finds or starts **Stories**.
_Avoid_: Home mode, landing page

**Management Mode**:
The workbench-like experience where a user reviews and changes **Story**
structure and related objects.
_Avoid_: Admin mode, project mode

**Document Mode**:
The document-first experience where a user reads or authors **Chapter** text.
_Avoid_: Reading mode, writing mode

**System Mode**:
The utility experience for app-level states such as unavailable paths,
installation choices, confirmations, and failures.
_Avoid_: Miscellaneous mode, error mode

## Relationships

- A **Saved Story** is a **Story**.
- An **Example Story Copy** is a **Saved Story**.
- A **Story** has zero or more **Chapters**.
- A **Story** has zero or more **Characters**.
- A **Built-in Example Story** can become a **Saved Story**.
- A **Built-in Example Story** can be adapted from zero or more **Source Works**.
- A **Built-in Example Story** can have **Story Provenance**.
- An **Example Story Copy** preserves the **Story Provenance** of its **Built-in Example Story**.
- A **Starter Section** contains zero or more **Built-in Example Stories**.
- A **Character** belongs to exactly one **Story**.
- A **Character** has zero or more **Character Properties**.
- A **Character Property** belongs to exactly one **Character**.
- A **Chapter** belongs to exactly one **Story**.
- A **Chapter Document** presents exactly one **Chapter**.
- A **Story** has zero or one **Intro Chapter**.
- A **Chapter** has zero or one parent **Chapter**.
- A **Chapter** can have zero or more **Branches**.
- **Chapters** in the same **Story** cannot form cycles.
- **Library Mode**, **Management Mode**, **Document Mode**, and **System Mode**
  are distinct TreeTales experience modes.

## Example dialogue

> **Dev:** "When a reader opens a **Story**, should they start at any chapter?"
> **Domain expert:** "No. They start at the **Intro Chapter**, then choose among its **Branches** as the story unfolds."
>
> **Dev:** "If the same **Character** appears across several **Branches**, should we create one per **Chapter**?"
> **Domain expert:** "No. A **Character** belongs to the **Story**, even if they appear in many **Chapters**."

## Flagged ambiguities

- "node" can describe the technical graph representation, but product language should use **Chapter**.
- "page" can mean either an app route or a readable **Chapter Document** —
  resolved: use **Chapter Document** for the presented **Chapter** text.
- "child chapter" describes the technical parent-child relationship, but product language should use **Branch**.
- "previous chapter" can imply browser or reader history — resolved: use **Parent Chapter** for structural navigation.
- "style" and "configuration" can imply broad editor or app settings — resolved: use **Reader Appearance** for **Chapter** document text presentation preferences.
- "Reader Appearance" was originally reading-only — resolved: it can also apply to chapter authoring surfaces when those surfaces present **Chapter** document text.
- "generate prompt" can sound like direct prose generation — resolved: use **Prompt Builder** for preparing copy-paste LLM prompts, not writing chapter content inside TreeTales.
- "draft" can mean saved **Chapter** content or temporary scratch input — resolved: use **Rough Plot** for Prompt Builder scratch text and **Chapter** content for authored markdown.
- "character" could mean a chapter-local appearance or a story-level entity — resolved: use **Character** for a story-level entity that can appear across many **Chapters**.
- "story" was originally defined as user-authored even though TreeTales includes seeded example content — resolved: **Story** covers both user-authored and built-in branching narratives, and **Built-in Example Story** names TreeTales-provided seeded content.
- "free to copy" can imply verbatim reuse — resolved: TreeTales should describe **Built-in Example Stories** as adapted from **Source Works** unless the app intentionally preserves copied source text.
- "licensed work" is broader than TreeTales needs for built-in examples — resolved: **Source Work** means U.S. public-domain material, not Creative Commons material.
- "real branching story" can mean either a historical branching work or a TreeTales-shaped example — resolved: historical works can validate source availability, while **Built-in Example Stories** should be authored for TreeTales unless verbatim preservation is intentional.
- "the example story" implied a single empty-state action — resolved: TreeTales can provide multiple **Built-in Example Stories** as first-run library content.
- "public-domain example" can imply source fidelity is the main goal — resolved: **Built-in Example Stories** primarily teach TreeTales **Chapter** and **Branch** mechanics, with **Source Works** used only when they help that goal.
- "multiple examples" can sprawl into a content library — resolved: the initial starter set should contain three **Built-in Example Stories**.
- "hello-world example" can satisfy mechanics without feeling like a real story — resolved: **Built-in Example Stories** should feel like complete story experiences, not placeholder tutorials.
- "concise example" can imply an artificial chapter cap — resolved: **Built-in Example Stories** can have as many **Chapters** as needed to feel complete, within the review budget for the implementing change.
- "classic adaptation" can imply over-familiar works — resolved: initial **Source Works** should avoid too-famous stories when a less obvious public-domain source fits.
- "adding examples" can mean either showing starters or writing local records — resolved: **Built-in Example Stories** are TreeTales-provided starters and become **Saved Stories** only when the user chooses one.
- "opening an example" can imply read-only preview — resolved: choosing a **Built-in Example Story** creates an editable **Example Story Copy** in the local library.
- "choosing the same example twice" can imply duplication — resolved: TreeTales should reuse an existing **Example Story Copy** unless a general duplicate-story action exists.
- "library examples" can imply saved user content — resolved: **Built-in Example Stories** belong in a **Starter Section** separate from **Saved Stories**.
- "starter examples" can imply an empty-state-only affordance — resolved: the **Starter Section** is prominent when there are no **Saved Stories** and secondary once saved content exists.
- "provenance" can imply starter-only metadata — resolved: **Story Provenance** follows an **Example Story Copy** after it becomes a **Saved Story**.
- "provenance" can imply user-authored story content — resolved: **Story Provenance** is read-only context, not an author-editable **Story** field.
- "citation" and "attribution" can imply a formal bibliography or legal notice in the reading flow — resolved: use **Story Provenance** for lightweight user-visible source context.
- "reading mode" and "writing mode" can split surfaces that share the same
  document-first treatment — resolved: use **Document Mode** for both
  **Chapter** reading and **Chapter** authoring experiences.
