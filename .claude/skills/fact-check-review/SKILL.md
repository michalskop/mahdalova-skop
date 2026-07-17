---
name: fact-check-review
description: Run an AI-assisted, human-in-the-loop editorial fact-checking pass over a draft article in this repo (apps/web or apps/datajournalism.studio) or over a pasted social media post, before it gets published. Extracts checkable claims (numbers, dates, names and titles, direct quotes, comparisons/superlatives), flags which ones have no nearby source, and cross-checks any ```factcheck verdict boxes against their surrounding text. Use this whenever the user asks to fact-check, verify, or review an article, post, or draft for accuracy before publishing — including requests like "ověř mi tenhle článek", "zkontroluj fakta v tomhle draftu", "projdi tenhle tweet/post než ho pošlu", or when they give you a article slug/path and ask if it's ready to go out. Also trigger when they paste raw draft text (no file) and ask you to check it before posting to social media.
---

# Fact-check review

This is the AI-assisted half of this repo's editorial fact-checking process. The human-owned process document is `docs/fact-checking-proces.md` — read it once at the start of a review to pull in the checklist you're applying (source hierarchy, the two-source rule for controversial claims, how the `verification` frontmatter field and the `​```factcheck` reader-facing verdict format work). Don't re-derive that checklist from scratch each time; that document is the source of truth for the rules, this skill is the source of truth for how to *apply* them mechanically to a piece of text.

The point of this skill is to do the tedious first pass — reading line by line and noting what's checkable and what's sourced — so the human editor's attention goes to judgment calls (is this source good enough? does this quote need re-confirming?) instead of the mechanical scan. You are a second pair of eyes, not the fact-checker of record. Never assert that a claim is actually true or false yourself — you're reporting whether it *appears* sourced, not verifying the underlying reality.

## Step 1: Get the content

Figure out what you're reviewing:

- **A repo article** — the user gives a slug or path (e.g. `jak-overujeme-fakta`, or `analyza-2026-04-02-kdo-vydelava-na-drahem-benzinu`). Look for it first at `apps/web/app/clanek/_articles/<slug>/index.md`, then at `apps/datajournalism.studio/app/a/_articles/<slug>/index.md`. Read the whole file, including frontmatter.
- **A social media draft** — the user pastes text directly in the conversation, or explicitly says there's no file (this content lives entirely outside the repo — X, Instagram, LinkedIn, Discord, etc.). Use the pasted text as-is; don't go looking for a file.
- If the user just says "fact-check this" with neither a slug nor pasted text, ask which one they mean before proceeding.

## Step 2: Extract checkable claims

Read the text and pull out everything a reader could independently verify or dispute:

- Numbers and statistics (amounts, percentages, counts, rankings)
- Dates and timeframes
- Named people, organizations, or their claimed roles/titles ("minister of X", "CEO of Y")
- Direct quotes attributed to someone
- Comparisons and superlatives ("highest since 2010", "poprvé v historii", "nejvíc ze všech")

Opinions and interpretation ("this policy is a mistake") are not claims to check — only the facts an opinion rests on are.

## Step 3: Check each claim for a nearby source

For each claim, look at the surrounding text for something that backs it up:

- A markdown link (`[text](url)`) near the claim
- An inline citation or attribution ("according to...", "podle...")
- For repo articles: a reference to a data file that actually exists in the article's own directory — e.g. a `dataFile="..."`, `yamlFile="..."`, or `csvFile="..."` attribute on a component like `MotionsStancesTable`, `KeyNumbers`, `Timeline`, or `StyledTable`. Check the file exists (`ls` the article's directory) rather than assuming.

If nothing nearby backs the claim up, flag it — don't guess whether a source exists elsewhere in the piece that you didn't notice; if genuinely unsure, mark it as needing human judgment rather than silently passing it.

## Step 4: Cross-check `factcheck` verdict boxes

If the text contains a ` ```factcheck ` fenced block (this repo's reader-facing verdict format — see `packages/ui/src/components/FactCheckBox.tsx` and `packages/ui/src/lib/remark-factcheck-plugin.js` if you need the exact verdict vocabulary: `pravda`/`true`, `nepravda`/`false`, `zavadejici`/`misleading`, `neoverene`/`unverifiable`), check that:

- the verdict word matches what the box's own text actually argues (e.g. a `nepravda`/`false` box whose body reads as ambivalent is a mismatch worth flagging),
- the box lists sources for the verdict, not just an assertion.

## Step 5: Report

Present your findings as a table, most-concerning first:

| Claim | Status | Note |
|---|---|---|
| "unemployment fell to 3.2% in March" | ⚠️ no source found | No link or citation nearby — check against ČSÚ data |
| "Novák said inflation was 'temporary'" | ✅ sourced | Linked to interview transcript |
| "first time this has happened since 1990" | ❓ needs human judgment | Superlative — worth a second source per the two-source rule |

Use exactly these three statuses: ✅ sourced, ⚠️ no source found, ❓ needs human judgment. After the table, briefly note anything from Step 4 (factcheck box mismatches) separately since those aren't plain claims.

If everything is well-sourced, say so plainly and keep the report short — don't manufacture concerns to seem thorough.

## Step 6: Offer to record sign-off (repo articles only)

After the human has had a chance to respond to the report, ask directly: have you resolved the flagged items? Don't assume yes.

If they confirm yes **and** the input was a real article file (not a pasted social post), offer to add or update this frontmatter block — but only write it after they explicitly confirm, and ask for their name if they haven't given it:

```yaml
verification:
  checkedBy: "<name they give you>"
  checkedAt: "<today's date, YYYY-MM-DD>"
```

Never set this field on your own initiative or before confirmation — it's a human sign-off, not an AI one, and `scripts/checkVerificationStatus.js` treats its presence as a claim that a person actually reviewed the piece. For pasted social media drafts there's no file to update — the report in Step 5 is the whole deliverable.
