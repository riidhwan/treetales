# Built-in Example Stories

Built-in Example Stories are TreeTales-provided starters shown separately from
Saved Stories. When a user chooses one, TreeTales creates or reuses an editable
Example Story Copy in the user's local library.

## Source Rules

- Use verifiably U.S. public-domain English-language source texts.
- Prefer less obvious source works over the most famous public-domain classics.
- Avoid source works that rely on modern translations, modern illustrations,
  another interactive/gamebook brand association, offensive stereotypes,
  colonial framing, or dated assumptions that would dominate the adaptation
  work.
- Adapt source material into TreeTales-shaped branching stories rather than
  copying source text verbatim by default.
- Preserve the source premise and core conflict, but allow TreeTales-authored
  alternate endings when they make branches meaningful. Document divergent
  outcomes in the adaptation note.
- Make each story feel like a complete story experience, not a placeholder
  tutorial.

## Provenance Review

Each Built-in Example Story should include:

- Source title
- Author or collector when known
- Publication year or source
- U.S. public-domain basis, retained as structured provenance review data
- Short adaptation note, retained as structured provenance review data
- User-visible Story Provenance text

User-visible Story Provenance should be authored in the starter catalog,
captured on the Example Story Copy, and kept factual and non-legalistic. Use
these patterns as guidance:

- `Adapted from "{Source Work}" by {Author}, first published {year}.`
- `Adapted from "{Source Work}", collected in {Collection}, first published {year}.`

Do not use claims such as "copyright-free", "free to use", or "public domain"
in app chrome unless TreeTales adds a fuller legal/source view.

## Initial Starter Set

The initial starter set should contain three Built-in Example Stories. Specific
Source Works should come from lesser-known 19th-century English-language
fairy/fantasy collections before using folklore anthologies with uncertain
translation chains. The initial set should use one source work from each
approved author/source collection so the Starter Section has varied tone and
premise.

Built-in Example Stories should display in authored catalog order. Do not sort
the Starter Section by title, publication year, or Source Work unless that
editorial order is intentionally changed.

Selected initial Source Works:

- Frank R. Stockton, "The Bee-Man of Orn", from _The Bee-Man of Orn and Other
  Fanciful Tales_ (1887), Project Gutenberg eBook #12067, public domain in the
  USA.
- Juliana Horatia Ewing, "The Magicians' Gifts", from _Old-Fashioned Fairy
  Tales_ (1880), Project Gutenberg eBook #15592, public domain in the USA.
- Evelyn Sharp, "The Wonderful Toymaker", from _All the Way to Fairyland_
  (1898), Project Gutenberg eBook #30400, available as a public-domain
  English-language source text. Do not use Mabel Dearmer's illustrations in the
  app unless illustration provenance is reviewed separately.

### The Bee-Man of Orn Adaptation

Source review:

- Source title: "The Bee-Man of Orn"
- Author: Frank R. Stockton
- Publication: _The Bee-Man of Orn and Other Fanciful Tales_, first published
  1887
- U.S. public-domain basis: Project Gutenberg eBook #12067, public domain in
  the USA
- User-visible Story Provenance: `Adapted from "The Bee-Man of Orn" by Frank R. Stockton, first published 1887.`

Adaptation note: adapted into a branching TreeTales starter from the source
premise. The main path follows the Bee-Man through the domain, mountain, dragon
rescue, and magical return; alternate branches let him reject the prophecy,
retreat from danger, or keep his old shape after the rescue.

The foundation implementation may introduce minimal starter fixtures for the
selected Source Works to prove catalog and service behavior. Full TreeTales
adaptations belong in the per-story content slices.
Minimal foundation fixtures should not be exposed through the normal Library
Mode UI before the Starter Section integration and content slices make the
starter experience production-ready.
Foundation tests should cover the starter catalog service, repository lookup,
copy creation/reuse, generated local ids, and provenance persistence. Hook and
UI tests belong with the Starter Section integration slice unless #182 changes
user-facing behavior.

Approved candidate source pools retained for future Built-in Example Stories:

- Frank R. Stockton, _The Bee-Man of Orn and Other Fanciful Tales_ (1887),
  Project Gutenberg eBook #12067, public domain in the USA. Candidate stories
  include "The Bee-Man of Orn", "Old Pipes and the Dryad", and "The Queen's
  Museum".
- Juliana Horatia Ewing, _Old-Fashioned Fairy Tales_ (1880), Project Gutenberg
  eBook #15592, public domain in the USA. Candidate stories include "Good Luck
  is Better than Gold", "The Magicians' Gifts", and "The Magic Jar".
- Evelyn Sharp, _All the Way to Fairyland_ (1898), Project Gutenberg eBook
  #30400, available as a public-domain English-language source text. Candidate
  stories include "The Wonderful Toymaker" and "The Story of Honey and Sunny".
