# Design Grill Interview Question Format

Use this format for every user-facing interview question asked by the
`design-grill` skill. The goal is a consistent, one-topic-at-a-time question
that lets the user accept a concrete recommendation or redirect it.

## Required Shape

Each interview question must include these parts in this order:

1. **Topic**:
   Name the single topic being decided, such as `Typography hierarchy`,
   `Density and spacing`, `Responsive behavior`, or `Empty/error states`.
2. **Settled facts**:
   State what the docs or code already settle for that topic. Include local
   source references when those facts affect the recommendation.
3. **Decision question**:
   Ask the actual decision question in user-facing terms.
4. **Recommended answer**:
   Give one concrete answer the user can accept as the decision.
5. **Reasoning**:
   Explain why the recommendation fits the product mode, current code, and
   likely user workflow.
6. **Confirmation prompt**:
   Ask whether the user agrees with the recommendation or wants a different
   direction.

## Template

```md
Question: {user-facing decision question}

Recommended answer: {Concrete decision the user can accept.}

Reasoning: {Why this fits the product mode, current code, and user workflow.}

Do you agree with that recommendation, or do you want a different direction?
```

## Rules

- Ask about one topic only unless several aspects are tightly coupled and the
  question names every coupled aspect explicitly.
- Do not ask the user to restate facts that docs or code already settle.
- Convert discovered facts into a recommendation before asking.
- Make the recommendation specific enough to implement without later guessing.
- Treat "agree", "approved", or similar as approval for the current question
  only, unless the user explicitly approves the whole remaining interview.
