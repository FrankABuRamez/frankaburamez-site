# The $9 AI Bug Bounty Playbook

> The expanded playbook for the Top 10 AI Bug Bounty Programs guide.
> Per-program report templates, one full worked first-bug walkthrough,
> and the submission scoring rubric triagers actually use.

— Frank · 2026-05-03

---

## What this is

You already have the free guide naming the Top 10 programs. This playbook is the next step: the *exact moves* to land your first paid finding.

Three things ship inside:

1. **Report templates** — per-program submission frames (Anthropic / Bugcrowd / huntr), word-for-word, that triagers reward.
2. **Worked walkthrough** — a full end-to-end first-bug story: target picked, methodology, reproducer, writeup, payout. ~$1,500 finding, reconstructed.
3. **The triager's rubric** — the unspoken scoring frame. Hit it, you get paid more.

If you only do one thing with this playbook: copy the report template for the program you're hunting, fill in the blanks, and submit. The format alone moves payout 20–40% on identical findings.

---

## Part 1 — Report Templates

### Template A: Anthropic Model Safety / HackerOne

**Use for:** Universal jailbreaks, agentic safety failures, model-misuse vectors, CBRN bypass demonstrations.

```
TITLE: [Generalized attack class] enables [harm category] across [N model variants]

SUMMARY (≤100 words):
A [technique name] reliably elicits [harm category] from Claude [model versions tested].
The attack generalizes across [list categories: bio, chem, weapons, etc.] without
needing per-category prompt engineering. Reproducible on a free-tier API key in
[N] turns. Below: methodology, two-prompt reproducer, full transcripts, generalization
proof, suggested mitigations.

THREAT MODEL:
- Attacker capability: [API access / web UI access / agentic tool use]
- Required prior knowledge: [public papers / none / specific framing skill]
- Real-world adversary fit: [scale 1-5, with reasoning]

REPRODUCER (minimal):
[Prompt 1 — verbatim]
[Prompt 2 — verbatim]
Expected output: [exact category of refusal-bypass observed]
Observed across: [list 3+ test runs with timestamps]

GENERALIZATION PROOF:
Same technique applied to [category B], [category C], [category D].
Transcripts at [link or below]. Same scaffolding, ≥3 distinct harm categories,
demonstrating the attack is a class-level failure not a single-prompt accident.

MITIGATION SUGGESTIONS:
1. [Specific classifier addition that would catch the technique pre-generation]
2. [Specific reasoning-time intervention]
3. [Specific RLHF/post-training data class]

DISCLOSURE TIMELINE & TRANSCRIPTS:
[Attached files / inline below]
```

**Why this template wins:** Anthropic's bar is *generalized* attack technique, not single jailbreak. The "GENERALIZATION PROOF" section is the difference between $1,500 and $15,000 on identical-feeling findings. The "MITIGATION SUGGESTIONS" section is what triagers cite when arguing for higher reward — it shows you understand the model architecture, not just the surface trick.

---

### Template B: Bugcrowd / OpenAI / general AI bounty

**Use for:** Prompt injection, agentic failures, content policy bypasses, plugin/tool abuse, training data leakage.

```
TITLE: [VRT class] in [feature/endpoint] — [one-line impact]

VRT MAPPING:
Primary: [exact VRT classification, e.g., A03:2024 — Indirect Prompt Injection]
Secondary: [if chained, list the chain]

EXECUTIVE SUMMARY (≤80 words for triage queue):
[Single sentence: what breaks, what attacker gets.]
[Single sentence: how reproducible, on what surface.]
[Single sentence: severity claim with one-word justification.]

REPRODUCER:
1. [Step — exact, copyable]
2. [Step — exact, copyable]
3. [Step — exact, copyable]
Expected behavior: [what should happen]
Actual behavior: [what does happen]
Evidence: [screenshot / HAR / transcript link]

IMPACT:
- Confidentiality: [SCORE + 1-line reasoning]
- Integrity:       [SCORE + 1-line reasoning]
- Availability:    [SCORE + 1-line reasoning]
- Practical exploit conditions: [list — auth required? user interaction?]

EVIDENCE:
[Screenshot 1 — labeled]
[Screenshot 2 — labeled]
[Network capture / transcript — link]

REMEDIATION (suggested):
[Specific code/policy change, not "validate input better"]

REFERENCES:
[Prior similar disclosures, CVEs, papers]
```

**Why this template wins:** Bugcrowd triagers process hundreds of submissions a week. The VRT mapping at the top jumps you to the front of the queue — you've already classified your own report into their taxonomy, saving them ~15 minutes of triage. The Impact CIA breakdown is what they use to set bounty band; doing it for them moves you up a band more often than not.

---

### Template C: huntr.com (open-source AI/ML repo CVE-class)

**Use for:** Pickle deserialization, YAML loader misuse, path traversal, SSRF, code injection in OSS AI/ML libraries.

```
TITLE: [Vulnerability class] in [repo/file/function] — [CVE candidate / not requested]

REPO: [github.com/org/repo]
AFFECTED VERSIONS: [list — verified] / [list — likely]
COMPONENT: [file:line]

VULNERABILITY:
[2-3 sentence description, plain English. What does the broken code do, what does
the fix look like.]

ROOT CAUSE:
[link or paste the exact lines]

PROOF OF CONCEPT:
```python
# minimal repro — runs on pip install [repo]==[version]
# expected: [normal behavior]
# observed: [exploit outcome]
[5-30 lines of working code]
```

IMPACT:
- Attacker capability: [remote, local, requires user interaction, requires admin]
- Worst-case outcome: [RCE / data exfil / DoS / privilege escalation]
- Real-world exposure: [is this on PyPI top-100? deployed on Hugging Face? referenced
  by langchain?]
- Affected user count estimate: [GitHub stars × deployment ratio guess]

SUGGESTED FIX:
```diff
- [vulnerable line]
+ [safe replacement]
```
[Or describe the architectural change if a one-liner won't do it]

CVE DECISION: [I am requesting / not requesting CVE assignment]
```

**Why this template wins:** huntr pays specifically for *fixable* findings. The PR-ready diff at the bottom is what gets your finding upgraded from "report" to "approved bounty" because the maintainer can merge your fix in one click. "Suggested fix" is not optional on huntr; it's the difference between $50 and $400 on identical bug classes.

---

## Part 2 — Worked Walkthrough: First Bounty in 30 Days

This is a reconstructed end-to-end story. Names are abstracted, technique is real,
the dollar figure is one of mine. Use it as a template for your own first hunt.

### The setup

- **Budget:** Zero. Free-tier accounts only.
- **Time:** ~3 hours/day for 30 days, mostly weekends and 30-min mornings.
- **Skill stack at start:** Comfortable with Python and `curl`. No prior bounty
  submissions. Read maybe 5 writeups online before starting.

### Day 1–3: Recon, not hunting

Pick **one deep program** and **one wide program**. I picked Anthropic Crash
Reports (deep — frontier model, accessible) and huntr.com (wide — open-source AI
supply chain, beginner-friendly).

For each, I read **every disclosed report from the last 90 days**. Did not write
a single line of attack code yet. The goal of these three days was to internalize
*what gets paid* and *what gets closed as out-of-scope*. By day 3 I had a one-page
note for each program: top 3 patterns paid, top 3 patterns rejected.

For huntr, the patterns were:
1. Pickle deserialization in model loaders → high payout, high acceptance
2. Path traversal in HTTP-fetching loaders → medium payout, easy to find
3. YAML `Loader=Loader` (unsafe) → medium payout, often dupes — check disclosed first

### Day 4–10: Picking targets

I sorted huntr's repo list by **GitHub stars × recent commit activity**. Active
repos with the kind of code that looks like a startup wrote it (less audited)
beat enterprise repos (more audited).

I picked three target repos. All had the same shape: small AI utility library,
2–6K stars, recently published a new feature involving file loading.

For each target I cloned the repo and ran:

```
grep -rn "pickle.load\|pickle.loads" .
grep -rn "yaml.load\|yaml.full_load" .
grep -rn "torch.load\b" .
grep -rn "open(.*\.\./" .
```

Dumb tools, paid hits. By end of day 10 I had three candidate vulnerabilities
in three different repos, with at least a 60% chance two were valid bugs.

### Day 11–17: Reproducing (the real work)

For each candidate I built a minimal reproducer. Two-thirds of the time was
spent NOT writing exploit code — it was spent making the reproducer **as small
as possible**. A 12-line reproducer beats a 200-line one even at the same
finding severity, because the triager can verify it in 90 seconds.

By day 17 I had one *clean*, reproducible vulnerability:
- A `torch.load()` call against a user-controllable path in a popular AI utility
  library, leading to arbitrary code execution on model load.
- 14-line reproducer.
- Worked on the latest released version on PyPI.

### Day 18: Writing the report

I used Template C above (the huntr one, before I'd written it down — this
walkthrough is partly how the template formed).

Spent ~3 hours on the report. Re-read it twice. Read it aloud once. The aloud
test catches half the issues — anywhere I tripped over my own sentence got
rewritten.

Submitted via huntr's reporter form. Marked CVE = requested.

### Day 19–24: Triage hell (this is normal)

- Day 19: triage acknowledged.
- Day 21: maintainer responded — wanted clarification on whether the path
  validation upstream caught it. I responded same day with a chained reproducer
  showing the upstream check was bypassable.
- Day 23: maintainer confirmed valid, requested fix. I'd already written the
  diff (in the template — that's what "Suggested Fix" is for). Linked it.
- Day 24: PR merged, bounty triggered.

### Day 26: Payout

**$1,400** to PayPal via huntr.

Lessons that scale beyond this single finding:

1. **The reproducer is the bounty.** Spend twice as long on it as you think.
2. **The fix in the report doubles the payout.** Maintainers reward "I made
   your job easy" submissions.
3. **Move fast on triager questions.** Same-day responses outperform same-week
   responses in payout tier.
4. **Read more than you write.** I read ~50 disclosed reports before submitting
   one. Future me would read 100.

---

## Part 3 — The Triager's Rubric (Unwritten)

This is the scoring frame I have inferred from triager-side conversations,
publicly-visible bounty bands, and pattern-matching across hundreds of
disclosed reports. Treat it as load-bearing folklore, not gospel — but
treat it.

### The 6 dimensions triagers actually weight

| Dimension | What it asks | Weight |
|---|---|---|
| **Reproducibility** | Can I reproduce in <5 min on a fresh box? | ⭐⭐⭐⭐⭐ |
| **Generalizability** | Is this a *class* of bug or a single instance? | ⭐⭐⭐⭐ |
| **Real-world impact** | What does an attacker actually get? | ⭐⭐⭐⭐ |
| **Report craft** | Does this read clean, classify itself, suggest fix? | ⭐⭐⭐ |
| **Novelty** | Have I seen this exact pattern before? | ⭐⭐⭐ |
| **Responsiveness** | Does the reporter answer questions same-day? | ⭐⭐ |

Notice **report craft** outranks **novelty**. A clean writeup of a "boring"
bug pays better than a sloppy writeup of a clever bug. Most hunters have
this backwards.

### The four tiers triagers route into

| Tier | Behavior | Dollar implication |
|---|---|---|
| **Insta-pay** | Triager reads, reproduces, approves in one sitting | Top-of-band |
| **Discuss-then-pay** | Maintainer asks 1-2 questions, then approves | Mid-band |
| **Negotiate** | Severity disputed, multiple rounds | Lower-band — and slower |
| **Reject / dupe / out-of-scope** | Closed with no payout | Zero |

The hunter side of the equation: the difference between **insta-pay** and
**discuss-then-pay** is almost entirely report craft. The difference between
**discuss-then-pay** and **negotiate** is almost entirely impact framing.
You can move yourself up a tier through writing alone, on the same finding.

### What triagers DON'T weight (despite folklore)

- **How long you spent.** No partial credit for effort.
- **Tool sophistication.** Custom fuzzer doesn't beat `grep`.
- **CVSS scores you assign yourself.** They re-score everything anyway.
- **How impressive the technique sounds.** "Got RCE via misconfigured S3 bucket"
  outpays "elegant timing-based oracle" 90% of the time.

---

## Closing — what to do tomorrow morning

1. Open the free Top-10 guide. Pick **two programs** — one deep, one wide.
2. Find the right report template above (A, B, or C). Copy it into a notes file.
3. Read 25 disclosed reports for your two programs. Make a list: top 3 paid
   patterns, top 3 rejected patterns.
4. Pick one target repo / endpoint / model. Run dumb recon (`grep`, `nmap`,
   prompt fuzzing — whatever fits the program type).
5. Find one candidate. Build the reproducer. Write the report against the
   template. Submit.

If steps 4-5 take 30 days, that is on track. If they take 90 days, that is
also on track. Most first-time bounty hunters quit at day 18 because they
are alone in the dark and don't see signal yet. Don't quit at day 18.

Bind your Telegram to BountyRecon while you do this. The bot pings you when
new programs launch — your second program, third program, and hundredth
program will not require this much hunting work because you will already
be on the wave when it comes.

→ **frankaburamez.tech/bountyrecon/**

— Frank
