# Beehiiv Welcome Flow — Manual Install

The Beehiiv API does **not** support programmatic creation of automations as of this build. The `POST /v2/publications/{pub_id}/automations` endpoint returns 404. Automations must be created in the Beehiiv UI.

This folder contains the 3 emails ready to paste in.

## Flow overview

| # | Trigger | Delay | File | Goal |
|---|---------|-------|------|------|
| 1 | New subscriber | 0 (immediate) | `welcome.md` | Deliver lead magnet, set expectations for 2 follow-ups |
| 2 | Subscribed 3 days ago | +3 days | `day3.md` | Upsell VIP ($19/mo daily AI crypto brief) |
| 3 | Subscribed 10 days ago | +10 days | `day10.md` | Upsell BountyRecon Pro ($49/mo) + AI Pack fallback ($49 one-time) |

## Install steps in Beehiiv UI

1. Sign in to Beehiiv -> publication "AI Tools Lab"
2. Sidebar -> **Automations** -> **New Automation**
3. Name it: `Welcome -> VIP -> BountyRecon`
4. Trigger: `Subscriber added to publication`
5. Add step 1 -> **Send Email** -> immediate
   - Subject + body from `welcome.md`
6. Add step 2 -> **Wait** -> 3 days
7. Add step 3 -> **Send Email**
   - Subject + body from `day3.md`
8. Add step 4 -> **Wait** -> 7 days (so day 10 from subscribe)
9. Add step 5 -> **Send Email**
   - Subject + body from `day10.md`
10. Review -> set live

## A/B testing

Each email file has subject line A + B. Beehiiv supports subject A/B testing on individual email steps — pick A as primary, B as variant, 50/50 split, optimize on open rate.

## Source publication

- Name: AI Tools Lab
- Pub ID prefix: `pub_a02319d9-...` (full ID in `~/.secrets/consolidated.env`)
- Subscribe form: https://subscribe-forms.beehiiv.com/8eb77187-2761-4f9f-8fa2-795e15247679

## Asset hosting note

The lead magnet currently lives at `lead-magnets/top-10-bug-bounty-2026.md` (raw markdown, served as text). For better delivery later, convert to PDF or render as an HTML page so the email link previews well and click-through is cleaner.
