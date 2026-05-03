# AI Crypto Workflow Pack

A field-tested toolkit for traders, researchers, and operators who use AI as a co-pilot. Five workflows. Production-grade prompts. No theory.

---

## How To Use This Pack

These workflows are model-agnostic. They have been tested on Claude Sonnet 4.6, Claude Opus 4.5, ChatGPT-5, and Gemini 2.5 Pro. Pick whichever you have access to. For long-context analysis (token due diligence, news digests over many URLs), Claude Sonnet handles depth better. For pure speed and cheap iteration, Haiku 4.5 or GPT-5 mini are fine. For tax math and code, any frontier model is sufficient — verify the output.

The pattern is the same for every workflow:

1. Open a fresh chat. Do not reuse a polluted context window. Each workflow assumes a clean slate.
2. Paste the entire prompt block, including the `<system>`-style framing and the variables in `{{double curly braces}}`.
3. Replace the `{{variables}}` with your real inputs — trade notes, URLs, ticker, CSV path, strategy idea.
4. Hit run. Read the output critically. These prompts are scaffolds, not oracles.
5. For workflows with code (Tax Lot Calculator, Backtester), run the code locally. Never paste private keys or seed phrases into any chat interface, ever.

Two ground rules. First, treat AI output as a senior analyst's first draft — useful, fast, occasionally wrong. Second, the value compounds when you re-run the same workflow on the same asset across weeks. The Token Due Diligence prompt run on the same project monthly will surface drift in narrative, tokenomics, and team sentiment that no single snapshot reveals. Build the habit. The pack pays for itself the first time it talks you out of a bad trade.

A final note on tone. None of these prompts ask the model to be enthusiastic, optimistic, or "exciting." They are intentionally cold. Crypto markets reward emotional flatness. Your AI workflow should reinforce that, not undermine it.

---

## Workflow 1: AI Trade Journal

### What it does

Converts raw, unstructured trade notes — the kind you scribble at 11pm after a session — into a structured journal entry with execution review, bias check, lesson extracted, and a searchable tag. The point is not to feel productive. The point is to build a corpus of your own decisions you can grep through six months from now to find the pattern that is currently costing you money. Most traders never review their own history because the friction of writing it up cleanly is too high. This prompt removes the friction.

### The Prompt

```
You are my trade journal assistant. You are not a coach, a cheerleader, or a
risk manager. You are a structured-writing tool. Your job is to take my raw
trade notes and produce a single journal entry in the exact schema below.

Be concise. Be accurate. Do not invent details I did not provide. If a field
cannot be filled from my notes, write "n/a" — do not guess.

RAW NOTES:
"""
{{paste raw notes here — can be messy, fragments, voice-to-text, anything}}
"""

OUTPUT SCHEMA (use this exact markdown structure):

## Trade Journal — {{YYYY-MM-DD}}

**Asset:** [ticker / pair]
**Direction:** [long / short / closed]
**Size:** [position size or % of account]
**Entry:** [price + reason in <15 words]
**Exit / Stop:** [price + reason in <15 words]
**Outcome:** [+/- USD or R-multiple, or "open"]

### Execution Review
- Did entry match plan? (yes/no/partial — one sentence why)
- Did exit match plan? (yes/no/partial — one sentence why)
- Slippage / fees noted? (yes/no — figure if known)

### Bias Check
Identify ONE cognitive bias that may have influenced this trade.
Choose from: FOMO, revenge trade, anchoring, confirmation bias,
recency bias, sunk cost, overconfidence, loss aversion, none-detected.
One sentence of evidence from my notes supporting the choice.

### Lesson
One sentence. Actionable. Not a platitude. If there is no real
lesson, write "no new lesson — repetition of [prior pattern]."

### Tag
A single lowercase hyphenated tag for grep-ability.
Examples: btc-breakout-fail, eth-funding-flip, alt-rotation-late.
```

### How to use

- Run it nightly, not weekly. Memory of a trade decays fast — by Friday you have already rewritten the story.
- Append the output to a single `journal.md` file. Do not split per-trade. You want one file you can search.
- Once a month, paste the last 30 entries back into Claude with the prompt: "Find the three most repeated bias tags and the three most repeated lesson themes."
- Do not let the model praise you. If it adds "great discipline!" or similar, edit it out before saving. Praise corrupts the dataset.
- For losing trades, resist the urge to soften the language in your raw notes. The prompt only works on honest inputs.

### Example output

```
## Trade Journal — 2026-04-22

**Asset:** SOL/USDT
**Direction:** long, closed
**Size:** 8% of account
**Entry:** 142.10 — bounce off prior range high, expecting continuation
**Exit / Stop:** 138.40 — stop hit on rejection wick
**Outcome:** -1.1R

### Execution Review
- Did entry match plan? Partial — entered 0.4% above planned trigger, chasing.
- Did exit match plan? Yes — stop honored without hesitation.
- Slippage / fees noted? Yes — ~$3 fees, negligible slippage.

### Bias Check
FOMO. Notes mention "felt like I'd miss it" — entered before confirmation candle closed.

### Lesson
Wait for the candle close on the trigger TF. Chasing cost ~30 bps of edge on a setup that was already marginal.

### Tag
sol-fomo-chase
```

---

## Workflow 2: Crypto News Digest

### What it does

Takes a list of crypto news URLs you collected during the day and returns a 5-bullet "what matters / what doesn't" digest in under 200 words. Designed for the trader who opens 40 tabs by 10am and reads none of them. The prompt is calibrated for signal extraction — it explicitly instructs the model to demote PR, funding announcements without product context, and influencer takes. The output is short enough to read in 90 seconds and structured enough to forward to a partner or Discord without editing.

### The Prompt

```
You are my crypto news triage analyst. I will give you a list of URLs from
today. Your job is to produce a 5-bullet digest that separates signal from
noise, in under 200 words total.

URLs:
{{paste 5-30 URLs here, one per line}}

RULES:
1. You may use your knowledge of crypto markets to contextualize, but do not
   fabricate facts about specific articles you cannot access. If a URL is
   inaccessible, say so in one bullet at the end.
2. Demote (treat as noise) the following unless they meet an exception:
   - Funding round announcements without shipped product
   - Price-prediction op-eds
   - Influencer Twitter drama
   - Exchange listing rumors not confirmed by the exchange
   - "Whale moved X" stories without on-chain context
3. Promote (treat as signal):
   - Regulatory actions or filings (SEC, CFTC, FCA, MiCA, etc.)
   - Protocol exploits, depegs, or insolvencies
   - Tokenomics changes (unlocks, burns, fee switches)
   - Major infrastructure shifts (L1/L2 upgrades, bridge changes)
   - Macro flows affecting BTC/ETH (ETF flows, miner behavior, basis)

OUTPUT FORMAT:

### What Matters
- [bullet 1: signal item, 1 sentence + 1 sentence on "so what"]
- [bullet 2: same]
- [bullet 3: same]

### What Doesn't
- [bullet 4: noise item bundled, e.g. "Three funding announcements (X, Y, Z) — pre-product, ignore."]

### Watch
- [bullet 5: something not yet news but likely to be — one sentence]

Hard limit: 200 words total. Count them.
```

### How to use

- Collect URLs throughout the day in a scratch note. Do not curate. Dump raw.
- Run once at end of day, not in real-time. The point is to compress, not to react.
- If the model cannot fetch URLs, paste the article titles + first paragraph instead. Quality drops slightly, structure holds.
- Save outputs in a `news/` folder dated by day. Quarterly, skim them. You will see narratives forming weeks before consensus.
- Do not ask the model to predict price impact. That is your job.

### Example output

```
### What Matters
- SEC filed amended complaint against [protocol] adding fraud charges; precedent risk for any project with similar token-distribution structure.
- Lido validator set passed governance vote to cap individual operator share at 1.5%; reduces ETH staking centralization tail-risk modestly.
- USDC redemptions hit $2.1B over 48h with no peg deviation; confirms reserve liquidity but signals institutional rotation out of stables.

### What Doesn't
- Four funding announcements (A, B, C, D) — all pre-product, ignore.
- Two "BTC to $X by year-end" op-eds — not actionable.

### Watch
- Three separate L2s announced fee-switch governance proposals this week; if any pass, sets template for token-holder cashflow rights.
```

---

## Workflow 3: Token Due Diligence Checklist

### What it does

A multi-section prompt that walks any token through a structured DD framework: tokenomics, team, on-chain metrics, narrative fit, red flags. Returns a final verdict of PASS, WATCHLIST, or SKIP with one-line justification. This is the workflow that should run before any new position above 1% of account. It will not catch every rug, but it will catch the obvious ones, and more importantly it forces you to articulate why you are buying — which alone filters out 60% of impulse trades.

### The Prompt

```
You are my token due diligence analyst. I am evaluating whether to take a
position in the asset below. Walk through the framework section by section.
Be skeptical by default. The null hypothesis is SKIP.

ASSET: {{ticker / project name / contract address if relevant}}
CHAIN: {{chain or "n/a"}}
THESIS (my reason for looking): {{1-3 sentences on why this is on my radar}}

You may use your training data and any tools available to you. If a fact is
unknown or unverifiable, mark it [UNKNOWN] — do not guess. Unknowns count
against the verdict.

=== SECTION 1: TOKENOMICS ===
- Total supply, circulating supply, fully diluted valuation
- Emission schedule for next 12 months (% inflation)
- Major unlock cliffs in next 6 months (date + % of supply)
- Token utility: governance / fee accrual / staking / pure speculation
- Insider/team allocation %, vested vs unlocked

=== SECTION 2: TEAM ===
- Doxxed or pseudonymous?
- Track record (prior projects, outcomes — successes AND failures)
- Recent team departures or hires (signal of internal state)
- Any regulatory or legal flags on key individuals

=== SECTION 3: ON-CHAIN METRICS ===
- Active addresses trend (last 90 days)
- Holder concentration (top 10 wallets % of supply, ex. exchanges/contracts)
- TVL trend if applicable (last 90 days)
- Real revenue (fees paid by users, not emissions)
- Token velocity / dormancy patterns

=== SECTION 4: NARRATIVE FIT ===
- Which current crypto narrative does this map to?
- Is the narrative early, mid, or late cycle?
- Who are the 3 nearest competitors and how does this rank?

=== SECTION 5: RED FLAGS ===
List every red flag you can identify. Be paranoid. Examples:
- Anonymous team with large unlocked allocation
- TVL primarily from incentive farming
- Audits absent, expired, or from low-tier firms
- Recent contract upgrades without transparency
- Wash-traded volume on obscure CEX listings
- Founder Twitter beefs as primary marketing
- "Partnerships" that are unilateral announcements

=== VERDICT ===
One of: PASS / WATCHLIST / SKIP
- PASS = thesis supported, red flags manageable, position sizing OK at intended size
- WATCHLIST = mixed signal, revisit in 30-90 days with specific trigger to upgrade
- SKIP = red flags or unknowns dominate; do not size in

Then: ONE SENTENCE of justification. No hedging.
```

### How to use

- Run it before any position over 1% of account. No exceptions, including "obvious" plays.
- Save the output. Re-run quarterly on existing holdings. Verdict drift is a sell signal.
- For SKIP results, save them too. You will be tempted to revisit. The saved SKIP is your friend.
- If the model returns WATCHLIST, write down the specific trigger that would upgrade to PASS. Without a trigger, WATCHLIST is procrastination.
- Cross-check on-chain claims with a block explorer or Dune. The model can hallucinate holder concentration figures.

### Example output

```
=== VERDICT ===
WATCHLIST

Justification: tokenomics are reasonable and team has prior shipped product, but 38% of supply unlocks across two cliffs in the next 90 days with no announced buyback or burn — revisit after the second unlock prints and price absorbs.
```

---

## Workflow 4: Tax Lot Calculator

### What it does

A two-part workflow — a prompt for instructing the model, plus a Python snippet you run locally — that takes a CSV of trades and produces a FIFO, LIFO, and HIFO realized PnL summary suitable for tax preparation. You compare the three methods and pick the one that minimizes tax (HIFO usually wins, but jurisdiction and asset-holding-period rules vary). The Python is intentionally simple, dependency-light, and inspectable. The prompt instructs the model to walk you through interpreting the output and flagging edge cases (wash sales, like-kind, staking income misclassified as trades). This is not financial or tax advice. It is a calculation tool. Take the output to a CPA who understands crypto.

### The CSV Format Expected

```
date,asset,side,quantity,price_usd,fee_usd
2025-01-15,BTC,buy,0.5,42000,5.00
2025-03-22,BTC,buy,0.25,68000,7.50
2025-08-10,BTC,sell,0.3,55000,4.20
```

Required columns exactly as named. Date in `YYYY-MM-DD`. `side` is `buy` or `sell`. Fees in USD.

### The Python Snippet

```python
"""
Tax lot calculator: FIFO / LIFO / HIFO realized PnL.
Save as tax_lots.py and run: python tax_lots.py trades.csv
Output: console summary + per-method CSV files in cwd.

NOT TAX ADVICE. Verify with a CPA.
"""
import csv
import sys
from collections import deque
from dataclasses import dataclass, field
from typing import List

@dataclass
class Lot:
    date: str
    qty: float
    cost_basis_per_unit: float  # includes proportional fee

@dataclass
class Realization:
    sell_date: str
    asset: str
    qty: float
    proceeds: float
    cost_basis: float
    pnl: float
    holding_days: int
    method: str

def load_trades(path):
    trades = []
    with open(path) as f:
        for row in csv.DictReader(f):
            trades.append({
                'date': row['date'],
                'asset': row['asset'].upper(),
                'side': row['side'].lower(),
                'qty': float(row['quantity']),
                'price': float(row['price_usd']),
                'fee': float(row['fee_usd']),
            })
    trades.sort(key=lambda t: t['date'])
    return trades

def days_between(a, b):
    from datetime import date
    da = date.fromisoformat(a)
    db = date.fromisoformat(b)
    return (db - da).days

def calc(trades, method):
    """method: 'FIFO' | 'LIFO' | 'HIFO'"""
    lots_by_asset = {}  # asset -> list[Lot]
    realizations: List[Realization] = []

    for t in trades:
        asset = t['asset']
        lots = lots_by_asset.setdefault(asset, [])

        if t['side'] == 'buy':
            cb_per_unit = t['price'] + (t['fee'] / t['qty'] if t['qty'] else 0)
            lots.append(Lot(date=t['date'], qty=t['qty'], cost_basis_per_unit=cb_per_unit))
            continue

        # sell: consume lots per method
        qty_to_sell = t['qty']
        proceeds_per_unit = t['price'] - (t['fee'] / t['qty'] if t['qty'] else 0)

        while qty_to_sell > 1e-12 and lots:
            if method == 'FIFO':
                idx = 0
            elif method == 'LIFO':
                idx = len(lots) - 1
            else:  # HIFO
                idx = max(range(len(lots)), key=lambda i: lots[i].cost_basis_per_unit)

            lot = lots[idx]
            take = min(qty_to_sell, lot.qty)
            proceeds = take * proceeds_per_unit
            cost = take * lot.cost_basis_per_unit
            realizations.append(Realization(
                sell_date=t['date'],
                asset=asset,
                qty=take,
                proceeds=proceeds,
                cost_basis=cost,
                pnl=proceeds - cost,
                holding_days=days_between(lot.date, t['date']),
                method=method,
            ))
            lot.qty -= take
            qty_to_sell -= take
            if lot.qty <= 1e-12:
                lots.pop(idx)

        if qty_to_sell > 1e-9:
            print(f"WARNING: {asset} sell on {t['date']} exceeds available lots by {qty_to_sell}")

    return realizations

def summarize(realizations, method):
    total_pnl = sum(r.pnl for r in realizations)
    short_term = sum(r.pnl for r in realizations if r.holding_days < 365)
    long_term = sum(r.pnl for r in realizations if r.holding_days >= 365)
    print(f"\n=== {method} ===")
    print(f"  Total realized PnL:  ${total_pnl:>14,.2f}")
    print(f"  Short-term (<365d):  ${short_term:>14,.2f}")
    print(f"  Long-term (>=365d):  ${long_term:>14,.2f}")
    print(f"  Realizations count:  {len(realizations)}")

def write_csv(realizations, method):
    path = f"realizations_{method.lower()}.csv"
    with open(path, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['sell_date', 'asset', 'qty', 'proceeds', 'cost_basis', 'pnl', 'holding_days', 'method'])
        for r in realizations:
            w.writerow([r.sell_date, r.asset, f"{r.qty:.8f}", f"{r.proceeds:.2f}",
                        f"{r.cost_basis:.2f}", f"{r.pnl:.2f}", r.holding_days, r.method])
    print(f"  Written: {path}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python tax_lots.py trades.csv")
        sys.exit(1)
    trades = load_trades(sys.argv[1])
    for method in ('FIFO', 'LIFO', 'HIFO'):
        rs = calc(trades, method)
        summarize(rs, method)
        write_csv(rs, method)
    print("\nNOT TAX ADVICE. Review with a qualified CPA.")

if __name__ == '__main__':
    main()
```

### The Companion Prompt

```
You are my tax-prep assistant for crypto realized PnL. I have run the
tax_lots.py script on my trade CSV and have three summary outputs (FIFO,
LIFO, HIFO) plus three per-realization CSVs.

OUTPUTS:
"""
{{paste the console summary block here}}
"""

Sample of realizations CSV (paste 10-20 rows):
"""
{{paste rows here}}
"""

JURISDICTION: {{country / state}}
TAX YEAR: {{year}}

Walk me through:

1. Which method (FIFO/LIFO/HIFO) results in the lowest total tax liability,
   given the short-term vs long-term split shown? Show the math.
2. Are there any realizations that look anomalous — e.g. negative proceeds,
   zero-cost-basis sells, holding periods exactly at the long-term cutoff
   that I should double-check?
3. Three things I should ask my CPA about specifically (e.g. wash sale
   applicability to crypto in my jurisdiction, staking income classification,
   airdrop cost basis treatment).

Do not give legal or tax advice. You are summarizing computed numbers and
flagging items for human review.
```

### How to use

- Export your CEX and on-chain trade history into one normalized CSV. This is the painful step — budget an afternoon.
- Run the Python script. Inspect the warnings — short lots usually mean missing buy entries from a transfer-in.
- Paste the summary + a sample of realizations into the companion prompt.
- Take the model's three "ask your CPA" items and actually ask. Crypto tax law is jurisdiction-specific and changes annually.
- Save everything — the CSV, the script outputs, the chat — for your records. Audit trails matter.

### Example output (from the prompt)

```
HIFO produces the lowest total liability in your numbers: $12,400 vs FIFO
$18,900 vs LIFO $15,100. The driver is your March 2025 buy at $68k being
matched against your August sell at $55k, generating a $3,900 short-term loss
under HIFO that FIFO leaves as an unrealized $13k loss on the older lot.

Anomalies to verify:
- One realization shows holding_days = 365 exactly. Confirm trade timestamps
  in UTC vs local — a one-day error flips long-term to short-term treatment.
- Two ETH sells have cost basis below $100/ETH; confirm those lots were not
  airdrops or staking rewards miscategorized as buys.

Ask your CPA:
1. Does your jurisdiction recognize HIFO for crypto, or default to FIFO?
2. Wash sale rule applicability — IRS has not formally extended it to crypto
   as of last guidance; state rules may differ.
3. Cost basis treatment for the two staking-reward-derived ETH lots.
```

---

## Workflow 5: Strategy Backtester Prompt

### What it does

Takes a trading strategy described in plain English and returns: pseudocode for the entry/exit logic, a list of key parameters to sweep, a rough risk-of-ruin estimate based on stated assumptions, and a description of what a sample equity curve would look like. This is not a backtest — it is the structured pre-work that should happen before you write a single line of backtest code, and which 90% of retail traders skip. The output is what a quant friend would give you over coffee if you asked "is this even worth coding up?"

### The Prompt

```
You are my strategy formalization assistant. I will describe a trading idea
in plain English. Your job is to convert it into a structured spec that I
can either (a) hand to a backtester or (b) use to decide it is not worth
backtesting.

STRATEGY DESCRIPTION:
"""
{{describe the strategy in 3-10 sentences. Include: what asset/market, what
triggers entry, what triggers exit, position sizing intuition, any filters}}
"""

ASSUMED CAPITAL: {{e.g. $25,000}}
ASSUMED RISK PER TRADE: {{e.g. 1% of capital}}
ASSUMED WIN RATE (your guess): {{e.g. 40%}}
ASSUMED AVG WIN / AVG LOSS RATIO: {{e.g. 2.0}}

Produce the following sections. Be specific. Avoid generic backtest advice.

=== 1. PSEUDOCODE ===
Entry logic, exit logic, and position sizing in language-agnostic
pseudocode. Should be tight enough that a competent engineer could
translate it to Python or Pine in under an hour.

=== 2. KEY PARAMETERS TO SWEEP ===
List 3-7 parameters that materially affect performance and the realistic
ranges to test. For each, note whether it is a "core thesis" parameter
(if it doesn't work in any range, the strategy is dead) vs an
"optimization" parameter (tunable for edge).

=== 3. RISK OF RUIN ESTIMATE ===
Using my assumed win rate, win/loss ratio, and risk per trade, estimate:
- Probability of 50% drawdown over 200 trades
- Probability of full ruin (account zero) over 1000 trades
- The Kelly fraction implied
- Whether my stated risk-per-trade is below, at, or above half-Kelly

Show the math briefly. Use the standard risk-of-ruin approximation; flag
the assumptions you are making.

=== 4. SAMPLE EQUITY CURVE DESCRIPTION ===
In words, describe what the equity curve would look like under the
assumed parameters over 200 trades. Mention:
- Expected total return range
- Likely max drawdown range
- Drawdown duration intuition
- Whether the curve will look "smooth" or "jagged" and why
- One or two psychological pitfalls likely to make the trader abandon
  the strategy mid-drawdown even if it is statistically working

=== 5. KILL CRITERIA ===
Three concrete, observable conditions under which I should stop trading
this strategy in live. These should be statistical, not emotional.
```

### How to use

- Run this BEFORE writing backtest code. The pseudocode + risk-of-ruin pass alone kills about half of strategy ideas.
- If risk of ruin is above 5% over 1000 trades at your stated risk per trade, halve the size and re-run.
- Save the pseudocode and kill criteria into a single `strategy_spec.md` file alongside the eventual backtest. Future-you will need them.
- For strategies that survive this stage, hand the pseudocode to Claude or Codex with: "Implement this as a vectorbt backtest using the parameter ranges in section 2."
- Re-run the prompt with adjusted assumptions if your win-rate guess turns out wrong in actual backtesting. The risk-of-ruin math changes fast.

### Example output

```
=== 3. RISK OF RUIN ESTIMATE ===

Inputs: win rate 40%, avg win/loss ratio 2.0, risk per trade 1%.

Edge per trade (in R units):
  E = 0.40 * 2.0 - 0.60 * 1.0 = 0.80 - 0.60 = +0.20R per trade.
  Positive edge — strategy is theoretically viable.

Kelly fraction:
  f* = W - (1-W)/R = 0.40 - 0.60/2.0 = 0.40 - 0.30 = 0.10
  Optimal Kelly size = 10% of capital per trade. Half-Kelly = 5%.
  Your stated 1% per trade is well below half-Kelly — conservative.

Probability of 50% drawdown over 200 trades:
  ~12% (Monte Carlo intuition; assumes IID trades, no correlation).

Probability of ruin over 1000 trades at 1% risk:
  Effectively 0% given positive edge and tiny per-trade size. The risk
  is not ruin — it is abandonment during normal drawdowns of 15-25%.

Caveats: this assumes trades are independent. If your entries are
correlated (e.g. all longs in BTC during a regime), real drawdown will
exceed model estimates by 1.5-2x.

=== 5. KILL CRITERIA ===
1. Win rate measured over a rolling 100-trade window drops below 32%
   for two consecutive windows.
2. Realized avg win/loss ratio falls below 1.4 over a rolling 100-trade
   window (the math stops working below ~1.5 at 40% win rate).
3. Max drawdown exceeds 35% — beyond model's 95th percentile, suggests
   regime change rather than normal variance.
```

---

## Lifetime Updates

This pack ships with lifetime updates. As models change, prompt patterns shift, and new workflows prove themselves in real trading, the pack gets revised. There is no subscription. There is no "premium tier." Pay once, get every future version.

What "updates" actually means:

- New workflows added when something earns its place. Not filler. The current bar is: I have personally used a workflow for at least 60 days in real trading or research, and it has measurably changed an outcome.
- Existing prompts revised when a frontier model release changes what works. The Token Due Diligence prompt, for instance, was rewritten three times across Claude 3.5 → Sonnet 4.6 because the older phrasing produced over-confident verdicts on the newer model.
- The Python in the Tax Lot Calculator gets patched if edge cases surface. If you find one, send it.
- Deprecated workflows get archived, not deleted. If a prompt stops working with frontier models, it moves to an `archive/` section with a note explaining what replaced it.

How updates are delivered: you receive an email with a link to the updated pack. Same file, same format, version-bumped at the top. No new account, no login. Keep your purchase email — that is your access.

If you have a workflow you have built and battle-tested in your own trading and want it included in a future version, send it. Credited contributions are how this pack stays sharp.

Contact: frank@frankaburamez.tech

---

*Educational content only. Not financial, legal, or tax advice.*
