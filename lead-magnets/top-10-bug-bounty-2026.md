# Top 10 AI Bug Bounty Programs to Hunt in 2026

> A field guide to the highest-paying, most accessible AI security bounty programs running right now — ranked, scoped, and shipped with one tactical tip per program.

---

## The AI bounty gold rush is real — and most hunters are still showing up late

Every major AI lab is now writing checks to people who can break their models. Anthropic, OpenAI, Google, Microsoft, Mozilla — the companies racing to ship frontier AI are also racing to harden it, and they pay well for outside eyes finding the holes their internal red teams missed.

The numbers are not modest. A single high-impact finding inside Anthropic's universal jailbreak program has paid up to **$25,000**. OpenAI has paid out **over $1M** through Bugcrowd. Microsoft's AI bounty maxes at **$30,000**. Google reformatted its bounty to put AI in its own track and pays up to **$30,000** for full chain exploits. Mozilla is paying **$15,000** specifically for AI red-teaming on Firefox AI features.

And unlike traditional web bounties — where the field is crowded, the surface is mapped, and dupes kill you — the AI surface is fresh. New model releases mean new attack surface every few weeks. Prompt injection, jailbreaks, training data extraction, agent escapes, tool-use exploits, content policy bypasses, RAG poisoning, and bio/chem misuse vectors are all live targets. Most of them did not exist as bounty categories two years ago.

This guide ranks the **10 programs worth your hunting time in 2026**, scored on a simple combination of payout ceiling, accessibility (how easy it is to actually get in and submit), and surface freshness. For each one you get the payout band, what they actually want you hunting, how to apply, and one tactical tip to make your first submission count.

If you finish this guide and want the boring tracking work done for you, BountyRecon scouts huntr / Bugcrowd / HackerOne automatically and pings your Telegram when a new AI program goes live or a scope changes. Link at the bottom.

Let's go.

---

## 1. Anthropic Model Safety Bounty

- **Payout range:** Up to **$25,000** for verified universal jailbreaks and high-severity model safety issues
- **Focus:** Universal jailbreaks against Claude, model misuse vectors, CBRN/bio policy bypasses, agentic safety failures
- **How to apply:** Application via HackerOne — the program runs invite-only / vetted. Apply at the Anthropic HackerOne page and demonstrate prior model-safety work in your application
- **Tip:** Submissions that show a *generalized* attack pattern (works across multiple harmful categories, not just one prompt) crush single-shot jailbreaks on payout. Document the technique, not just the output. They reward methodology

## 2. OpenAI Bio Bug Bounty

- **Payout range:** Up to **$25,000** for novel bio/chem-related model misuse with reproducible chain-of-thought exploitation
- **Focus:** Bioweapon/chemistry uplift via ChatGPT, multi-turn elicitation, system prompt override leading to dangerous synthesis info
- **How to apply:** Public program on Bugcrowd under OpenAI's main brand. Read the bio-specific scope addendum carefully — out-of-scope submissions get filtered fast
- **Tip:** Triagers reward *transcripts that read like uplift* — meaning a non-expert could plausibly use the output to make progress. Pure refusals broken into pure refusals don't count. Show capability transfer

## 3. Microsoft AI Bounty (MSRC)

- **Payout range:** **$2,000 to $30,000** depending on severity, with bonus multipliers on Copilot products
- **Focus:** Copilot in M365, GitHub Copilot, Bing Chat / Copilot in Edge, Azure AI services, prompt injection leading to data exfiltration, indirect injection via documents
- **How to apply:** Direct submission to MSRC at `msrc.microsoft.com/report` — pick the AI Bounty program from the dropdown. No invite required
- **Tip:** Indirect prompt injection through a *user-uploaded document* that exfiltrates email/calendar context is the highest-paying recurring class here. Build a payload-bearing PDF or Word doc proof-of-concept

## 4. Google AI Bug Bounty (BugSwat / VRP)

- **Payout range:** Up to **$30,000** for full-chain AI exploits, with separate scaled rewards for Gemini, AI Overviews, Workspace AI features
- **Focus:** Gemini API/app, AI Overviews, NotebookLM, Workspace Duet/Gemini, prompt injection, training data leakage, model rerouting
- **How to apply:** Submit at `bughunters.google.com` — pick the AI track. Public, no invite. Google also runs periodic live "BugSwat" events with bonus pools
- **Tip:** Watch the Google Bug Hunters blog for BugSwat announcements. Live events have lower noise, fresher scope, and frequently double payout for top finders. Mark your calendar when one drops

## 5. HackerOne AI track

- **Payout range:** Varies wildly — **$500 to $25,000+** depending on which company's program you're hitting
- **Focus:** HackerOne now hosts dedicated AI programs across dozens of companies (Snap, Shopify, Yelp, OpenAI, Anthropic, and more). Filter their program directory by AI/ML
- **How to apply:** Free HackerOne account, then filter `Programs -> AI/ML`. Most are public; some require invite based on past reputation
- **Tip:** Sort the AI programs by *bounty awarded last 90 days* — that signal beats payout ceiling because it tells you which programs are actually cutting checks vs. just listing big numbers

## 6. Bugcrowd AI programs

- **Payout range:** **$250 to $25,000+**, with OpenAI and several enterprise AI products being the headline payers
- **Focus:** OpenAI's main program lives here, alongside multiple AI startup programs. Strong on prompt injection, agentic failures, content policy bypasses, plugin/tool abuse
- **How to apply:** Free Bugcrowd account, then visit the public programs index and filter for AI/LLM. Reputation-gated invites unlock as you submit valid finds
- **Tip:** Bugcrowd's VRT (Vulnerability Rating Taxonomy) recently added AI-specific categories. Map your finding to a specific VRT entry in your title — triage moves measurably faster on submissions that pre-classify themselves

## 7. huntr.com

- **Payout range:** **$50 to $4,000+** per find, with bonus pools for critical chains in popular AI/ML repos
- **Focus:** Open-source AI/ML supply chain — vulns in PyTorch, TensorFlow, Hugging Face Transformers, LangChain, vLLM, MLflow, Gradio, and hundreds of smaller repos
- **How to apply:** Free huntr account, browse the disclosed repos list, find an unfixed CVE-class issue. No invite needed. This is *the* easiest AI program for first-timers to land a paid finding
- **Tip:** Pickle deserialization, YAML loader misuse, path traversal in model loaders, and SSRF in inference servers are the recurring win patterns. Search the disclosed reports for these classes and look for siblings in similar repos

## 8. Intigriti AI programs

- **Payout range:** **EUR 500 to EUR 15,000** depending on program and severity, with European AI labs paying premium
- **Focus:** EU-based AI companies (Mistral-adjacent, Hugging Face, several enterprise AI vendors run programs here). Strong scope on data privacy, GDPR-relevant model leakage, prompt injection
- **How to apply:** Free Intigriti account, public programs available immediately. EU citizens have a small edge on compliance-related finds
- **Tip:** Intigriti pays in Euros and bonuses are common — but their dupe window is shorter than HackerOne. Submit fast and submit clean. Quality of writeup directly moves bonus dollars here

## 9. Anthropic Crash Reports

- **Payout range:** **$100 to $5,000** for reproducible crashes, hangs, and resource exhaustion against Claude API and Claude.ai
- **Focus:** Stability and reliability — payloads that crash inference, exhaust context handling, trigger denial-of-service patterns, or reproduce hard failure modes
- **How to apply:** Submit through Anthropic's HackerOne. This is the more accessible Anthropic program (the model safety bounty above is invite-only)
- **Tip:** Long-tail unicode, deeply nested tool-call payloads, and adversarial token sequences are the recurring win pattern. Anthropic also rewards minimal reproducer cases — your repro should fit in under 100 lines and run on a free-tier API key

## 10. Mozilla AI red-teaming

- **Payout range:** Up to **$15,000** for high-impact red-team findings on Firefox AI features and Mozilla AI infrastructure
- **Focus:** AI-powered features in Firefox (alt-text generation, translations, AI sidebar, smart tab grouping), prompt injection through web content, model rerouting, exfiltration of browsing context
- **How to apply:** Mozilla's bug bounty submission portal — pick the AI/ML category. Public program
- **Tip:** Web-content-as-injection-vector is the highest-payout class here because Firefox renders untrusted HTML constantly. A malicious page that hijacks the AI sidebar and exfiltrates browsing context is the dream submission

---

## How to actually run this in 2026

**Pick two, not ten.** Hunters who try to track ten programs end up landing zero. Pick one *deep* (Anthropic, OpenAI, or Google) and one *wide* (huntr or Bugcrowd) and run them in parallel. The deep program teaches you frontier-model attack craft. The wide program lands you paid finds while you learn.

**Read disclosed reports first.** Every program above publishes resolved bounties (huntr is the gold standard for this). Spend a weekend reading the last 50 disclosures before you submit anything. You will see the patterns triage actually pays for, instead of guessing.

**Write your reports for the triager, not for yourself.** A clean writeup with reproducer, impact statement, and severity mapping converts to higher payout than an identical finding written messily. Treat the writeup as half the bounty.

**Track scope changes.** AI programs update scope constantly — new models drop, new features go GA, scope expands and contracts. Hunters who notice scope changes within hours capture the fresh-surface bounty before the field catches up.

---

## Don't track these manually — let a bot do it

You should not be opening ten tabs every morning to check whether huntr added a new repo, whether Bugcrowd updated OpenAI's scope, or whether HackerOne flipped a program from invite to public.

**BountyRecon scouts huntr / Bugcrowd / HackerOne for you and pings your Telegram when something changes** — new AI programs, scope updates, payout bumps, freshly disclosed reports worth reading. You sleep, it scouts, you wake up to a queue worth attacking.

**-> frankaburamez.tech/bountyrecon/**

## Optional — daily AI crypto context

If you also trade or follow the AI/crypto convergence (NEAR, FET, RNDR, TAO, AI agent coins), the daily VIP brief is a 5-minute read each weekday morning with BTC + ETH context, top mover, one swing setup, and macro pulse.

**-> frankaburamez.tech/vip.html**

---

*Ship fast. Hunt smart. Get paid.*
