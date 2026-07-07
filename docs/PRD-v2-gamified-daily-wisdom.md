**Luma**

Product Requirements Document (v2.0)

*A Gamified Daily Wisdom App for Children*

Document owner: Andy

Status: Draft for review

Date: July 3, 2026

*Note: this is a new product direction, not an update to the earlier "13-year AI-companion curriculum" PRD.*

Table of Contents

1\. Executive Summary

**The problem.** Books like street-smart safety guides, Murphy's-Law-style resilience books, and "100,000 Whys"-style encyclopedias have quietly taught generations of kids practical wisdom that school doesn't cover --- but they're static, easy to abandon after the first chapter, and don't fit how kids actually spend their spare five minutes today: on a phone. Meanwhile, most kids' learning apps either chase school-curriculum credibility (dry, homework-adjacent) or chase engagement with loud arcade mechanics (mascots, XP, leaderboards) that read as entertainment products, not something a parent feels good handing over.

**The one-line pitch.** Luma turns life-wisdom books into a daily 15-minute app habit for kids --- bite-sized wisdom, gamified progress, no pressure, no curriculum commitment.

**What makes this different from a book.** A book is linear and easy to put down; Luma is a living, ever-growing library that a child returns to because the app itself creates a gentle daily rhythm (see Section 4) and lets them build a personal collection of favorites (Section 3) rather than a shelf item they finish once.

**What makes this different from a typical kids' learning app.** Most gamified kids' apps optimize for maximum daily engagement through loud mascots, streak anxiety, and leaderboards --- mechanics increasingly criticized even in category leaders (Duolingo's streak system, for instance, is well documented to produce "streak fever" anxiety in young users rather than genuine mastery). Luma deliberately caps daily progress instead of maximizing it, and pairs that with a restrained, editorial visual language --- closer to a beautifully designed children's book than a game --- so it reads to parents as trustworthy and to kids as a calm, rewarding ritual rather than a dopamine loop.

**v1 scope.** A content-first, AI-generated-and-human-reviewed library of short "Wisdom" entries across seven categories, delivered through a daily-capped, gamified unlock system, with a lightweight parent view and no AI chat companion --- a deliberate scope reduction from a more ambitious AI-companion concept explored earlier, in favor of shipping something leaner, safer, and faster to validate.

2\. Target Users

2.1 Child personas by age band

**Ages 5--7 --- early reader / read-aloud.** Needs short, simple text or audio narration, large friendly type, and exercises that lean on tapping/selecting over typing. Attention span per session is short (a single Wisdom, not several). Parents likely drive initial app opens.

**Ages 8--10 --- independent reader, habit-forming.** Can read a Wisdom unassisted and complete varied exercise types independently. This is likely the core early-adopter band: old enough to use a phone/tablet somewhat independently, young enough that "collecting" and "unlocking" still feels genuinely motivating without needing to feel like a mature app.

**Ages 11--13 --- tween, identity-conscious.** Wants content and design that doesn't read as "babyish"; drawn to the trivia/curiosity and social-navigation content in particular. This band is most likely to reject an app with cartoon mascots or overtly childish visual language, which directly informs the visual design direction in Section 9.

(v1 targets roughly ages 6--13 as the core content design range; a distinct teen-facing edition for 14--17 is deferred to the roadmap --- see Section 12 --- since tone, topic sensitivity, and design language would need meaningful adaptation rather than just harder quiz questions.)

2.2 Parent persona

**"The Discerning Parent" --- primary persona, and the one downloading/paying.** Wants their child to spend spare phone/tablet time on something better than passive video or a loud mobile game, without signing up for a full curriculum commitment or another thing to manage. Values design and tone as a proxy for trust --- a polished, calm-feeling app signals "this was made thoughtfully" in a way a cartoon-mascot app doesn't, even before reading a single Wisdom. Wants light visibility into what their child is engaging with (Section 8), but doesn't want or need a school-style progress-tracking dashboard.

3\. Core Loop

The core content unit is a "Wisdom": a short, book-style story or text teaching one practical piece of wisdom, followed by a set of reinforcement exercises. The number of exercises varies by Wisdom --- some are quick, some more involved.

**1. Open app.** Child lands on the category map / home view showing all seven paths at a glance, each with its current unlock state (see Section 4).

**2. See today's available wisdom(s).** Within any path the child enters, the next available Wisdom is clearly presented (title, short teaser, icon); upcoming Wisdoms further down the path are visible as locked previews so the child always has a sense of what's coming, not just what's next.

**3. Read.** The child reads (or listens to, for younger bands) the Wisdom's story/text --- short, book-style, single-sitting length.

**4. Do exercises.** A mix of exercise formats reinforces the Wisdom: multiple choice, true/false, and scenario-based "what would you do if..." prompts. Exercises are presented one at a time in a simple, calm flow --- no timers, no penalty for a wrong answer beyond a gentle "try again" or explanation.

**5. Complete.** Once all exercises for a Wisdom are finished, it's marked "done" --- logged to the child's progress and eligible to be favorited.

**6. Unlock state updates.** Completing a Wisdom is one of two conditions required to reveal the next Wisdom in that path (see Section 4 for the full daily-cap mechanic); the app reflects the updated state immediately, even if the actual unlock is still gated by the daily-reset condition.

**7. Favorite / revisit.** At any point after completion, the child can bookmark a Wisdom into their personal favorites/library, and can browse and re-read any completed or favorited Wisdom at any time, regardless of path progress --- completion never locks content away.

Because children can move freely between the seven category paths, finishing today's available Wisdom in one path never fully blocks the session --- the child can simply switch to another path with its own available Wisdom, which keeps the daily cap from feeling like a wall (see Section 4).

4\. Gamification & Unlock System

4.1 The daily-cap + completion-gate mechanic

The next Wisdom in a given path unlocks only when both conditions are satisfied, whichever is met later:

-   Completion condition: the child has finished all exercises for the current Wisdom in that path.

-   Time condition: a new day has started (local device day boundary) since the current Wisdom was unlocked.

In practice this means a highly motivated child cannot binge through an entire category path in one sitting --- completing today's Wisdom early simply means tomorrow's Wisdom is ready the moment the day rolls over, rather than immediately. Conversely, a child who forgets to open the app for a few days doesn't lose anything: the next Wisdom is simply waiting whenever they return, and completing it that day still only unlocks the following one at the next day boundary. This produces a habit-shaping cadence --- roughly one new Wisdom per path per day --- without punishing inconsistency the way a hard streak-break mechanic does.

4.2 Why not a traditional streak system

Aggressive daily-streak mechanics (as popularized by language-learning apps) are effective at producing consistency but are increasingly documented to produce anxiety in young users --- a broken multi-hundred-day streak can feel like a genuine loss to a 10-year-old, which cuts against Luma's calm, low-pressure positioning. Luma's mechanic borrows the habit-forming logic of a daily cap without the loss-aversion sting of a visible streak counter that can "break": progress is framed as always-available and cumulative (a growing library, see Section 4.4) rather than a fragile chain that resets to zero.

4.3 Multi-path freedom

Because the daily cap applies per-path rather than globally, a child engaged across multiple categories effectively has several "today's Wisdom" slots available at once, which both reduces the feeling of being blocked and naturally encourages sampling across all seven pillars rather than tunneling into one favorite category.

4.4 Visualizing progress across category paths

-   Category map / path view: each of the seven categories renders as its own visual path (a restrained, editorial take on a level map --- see Section 9 for visual direction) showing completed Wisdoms, the current unlocked one, and locked upcoming previews by title/icon only.

-   Progress is cumulative, not resettable: a path simply grows longer over time; there is no "streak" number that can hit zero, only a library that keeps growing.

-   Optional gentle momentum indicator: a soft, non-numeric visual cue (e.g., a subtly filled progress dot per day engaged this week) can signal consistency without the loss-aversion mechanics of a break-able streak counter --- to be validated in design/user testing rather than assumed.

-   Rewards are collection-based, not currency-based: no in-app points/currency to spend, no loot-box mechanics; the "reward" for consistency is a growing, browsable personal library (Section 4.5) plus tasteful completion acknowledgment (a simple visual state change, not a confetti/arcade animation).

4.5 Favorites / personal library

Any completed Wisdom can be bookmarked into a personal favorites collection, accessible from its own dedicated view (Section 9). This is a deliberate product decision to make Luma feel like a reference the child owns and returns to on their own terms ("what was that thing about lying to feel confident?") rather than a one-way progress bar that's only ever looking forward --- reinforcing the "growing personal library" framing over a "curriculum to finish" framing.

5\. Content Architecture

Seven themed categories ("paths"), each an independent, ever-growing sequence of Wisdoms. The topic lists below are illustrative starter examples for each category, not an exhaustive content plan.

Street Wisdom --- safety, recognizing manipulation, trusting instincts

  -------- -----------------------------------------------------------------------------
  **\#**   **Example wisdom topic (starter list)**
  1        What to do if you get separated from your group in a crowded place
  2        Spotting when someone's being too nice, too fast, and what that can mean
  3        The "trust your gut" feeling --- what it is and why it's worth listening to
  4        What a real emergency looks like vs. what feels scary but isn't
  5        How to ask a stranger for help safely if you actually need it
  -------- -----------------------------------------------------------------------------

Money Wisdom --- saving, investing, budgeting, delayed gratification, entrepreneurship

  -------- --------------------------------------------------------------------
  **\#**   **Example wisdom topic (starter list)**
  1        Why waiting to buy something can feel worse before it feels better
  2        The lemonade-stand math: what "profit" actually means
  3        A letter about what money can --- and can't --- buy you
  4        What "interest" means, told through a simple savings-jar story
  5        Spotting a deal that's too good to be true
  -------- --------------------------------------------------------------------

Thinking Wisdom --- critical thinking, decision-making, evaluating information, bias

  -------- ---------------------------------------------------------------------
  **\#**   **Example wisdom topic (starter list)**
  1        How to tell a fact from an opinion someone said confidently
  2        Why we believe things faster when we already wanted to believe them
  3        A brain-teaser about assumptions that turn out to be wrong
  4        How ads are built to make you want things you didn't want yesterday
  5        The "how do you know that?" habit
  -------- ---------------------------------------------------------------------

People Wisdom --- trust, friendship, communication, negotiation, leadership

  -------- -----------------------------------------------------------------------------
  **\#**   **Example wisdom topic (starter list)**
  1        What to say when a friend is upset with you and you don't know why
  2        Trading fairly: a kid's guide to negotiating without anyone feeling cheated
  3        Noticing when someone's being left out, and what to do about it
  4        How to disagree with a friend without losing the friendship
  5        What makes someone actually trustworthy, not just liked
  -------- -----------------------------------------------------------------------------

Character Wisdom --- integrity, responsibility, courage, discipline, resilience

  -------- ---------------------------------------------------------------
  **\#**   **Example wisdom topic (starter list)**
  1        Murphy's Law for kids: what to do when your plan falls apart
  2        Telling the truth when a small lie would be so much easier
  3        What "discipline" really means (hint: it's not punishment)
  4        Losing well: what to do with the feeling right after you lose
  5        Being brave in small, everyday ways
  -------- ---------------------------------------------------------------

Modern World Wisdom --- AI literacy, digital privacy, online safety, misinformation

  -------- ----------------------------------------------------------------
  **\#**   **Example wisdom topic (starter list)**
  1        How to tell if a photo or video might be fake
  2        What an AI chatbot actually knows (and doesn't)
  3        What "private" means when you're posting or chatting online
  4        Why apps are built to keep you scrolling, and how to notice it
  5        What to do if someone online asks you something that feels off
  -------- ----------------------------------------------------------------

Life Wisdom --- practical knowledge for growing up

  -------- -----------------------------------------------------------------
  **\#**   **Example wisdom topic (starter list)**
  1        Why does bread go moldy? (curiosity/trivia-style entry)
  2        How to make a decision when you can't decide
  3        Basic kitchen safety for cooking something simple
  4        What a good apology actually sounds like
  5        Packing a bag for a trip without forgetting the important stuff
  -------- -----------------------------------------------------------------

5.1 Exercise-type variety per wisdom

Each Wisdom pulls from a shared pool of exercise formats, mixed to fit the content rather than applying the same format uniformly:

-   Multiple choice --- straightforward comprehension or application checks.

-   True/false --- quick, low-friction reinforcement, good for younger bands or shorter Wisdoms.

-   Scenario prompts ("what would you do if...") --- open-ended-feeling but structured (e.g., choose-a-path or short free response evaluated against a rubric), the closest analog to the story-based tone of the source inspiration.

-   Brain-teaser/logic formats --- puzzle-style exercises, a natural fit for Thinking Wisdom and Life Wisdom entries drawing on the trivia/riddle tonal reference.

-   Matching/ordering --- e.g., matching a scenario to the right response, or ordering steps in a process.

Tone variety is a deliberate content requirement, not just an exercise-format requirement: even within one category, entries should draw from different tonal registers (funny/Murphy's-Law-style, curious/trivia-style, safety-serious, reflective/letter-style, puzzle-like) so the library doesn't start to feel formulaic --- this should be an explicit checklist item in the content review step (Section 6).

6\. AI Content Generation & Review Pipeline

6.1 Generation

Wisdom entries (story/text plus exercises) are AI-generated using a structured content brief per entry: category, target age band, desired tone/register (drawing on the tonal/structural inspiration list in the concept brief --- never as source material to copy or closely paraphrase), core principle to teach, and required exercise mix. The generation prompt pipeline should explicitly instruct for original phrasing, scenarios, and characters --- not adaptations of any specific existing book's text, characters, or distinctive phrasing.

6.2 Human review before publishing

No AI-generated Wisdom reaches a child without a human review/approval step --- a core, non-negotiable part of the pipeline. A reviewer checks:

-   Originality: the entry doesn't closely paraphrase, lift structure from, or otherwise derive too closely from any identifiable existing copyrighted work.

-   Age-appropriateness: language complexity, subject handling, and any implied scenarios are suitable for the target age band.

-   Factual accuracy: especially for trivia/"why does X happen" style entries and any Money Wisdom content involving real-world mechanics (interest, saving, etc.).

-   Safety and sensitivity: no content that could frighten, shame, or mislead a child, and correct handling of any Street Wisdom/Modern World Wisdom safety content specifically.

-   Tone fit and non-repetition: the entry uses a tonal register that isn't overrepresented in that category already (see Section 5.1).

-   Exercise quality: questions are unambiguous, answers are clearly correct/incorrect or well-defined for scenario prompts, and difficulty fits the age band.

Reviewers are trained, accountable humans (initially likely a small internal content/education team; potentially augmented by contracted child-education or child-development reviewers as volume grows) --- not a second AI pass presented as sufficient review.

6.3 Versioning and updates

-   Every published Wisdom is versioned; edits after publication (correcting an error, refreshing an example) go through the same review gate before replacing the live version.

-   A child's completion/favorite record persists across a content revision to the same Wisdom slot, rather than resetting, unless the revision is substantial enough to be treated as a new entry.

-   A content calendar/backlog process ensures each of the seven paths has a healthy runway of reviewed-and-approved-but-not-yet-published Wisdoms queued up, so the daily-unlock mechanic (Section 4) never runs ahead of available content.

7\. Child Safety & Privacy

Because v1 deliberately excludes any AI chat companion or open-ended child input to an AI system, Luma's safety surface area is meaningfully smaller than a conversational-AI product: content is static once published and reviewed, so the primary safety questions are about content quality/appropriateness (Section 6) and data minimization rather than real-time AI moderation of child-generated text.

7.1 Regulatory framework

**COPPA (US).** Verifiable parental consent before collecting any personal information from a child account; under the amended COPPA Rule (compliance deadline April 22, 2026), this includes an expanded personal-information definition and a requirement to publish data retention limits with no indefinite retention. Since Luma v1 doesn't require child-generated free-text input to an AI system, the amended Rule's strictest new provisions (separate consent before using child data for AI model training) are largely moot for v1 --- but should be revisited if a future AI companion (Section 12) is added.

**UK Children's Code / Age-Appropriate Design Code and EU GDPR-K.** High-privacy-by-default settings, no profiling or geolocation, no manipulative "nudge" design encouraging children to weaken privacy settings, and (per the UK's binding Article 25 update effective June 19, 2025) privacy-by-design treated as a hard legal requirement rather than best-practice guidance. Luma's minimal data footprint (Section 7.2) is designed to satisfy this by default rather than requiring case-by-case justification.

7.2 Data handling principles

-   Data minimization: collect only what's needed to run progress tracking, unlock state, and favorites --- no behavioral advertising data, no third-party analytics SDKs that profile children.

-   No free-text child input in v1: exercises use structured response formats (multiple choice, true/false, matching, constrained scenario choices) rather than open text fields, which both simplifies the safety surface and avoids collecting unstructured personal content from children.

-   Verifiable parental consent at account creation, with a compliant consent mechanism before any child profile is created.

-   Published, enforced data retention and deletion policy, with a working parent-initiated deletion flow.

-   No data ever used for AI model training or shared with advertisers.

7.3 Content moderation and age-appropriateness for AI-generated content

-   Automated content screening (profanity, tone, reading-level scoring) as a first-pass filter before entries reach human review, not a replacement for it.

-   Mandatory human sign-off before publishing (Section 6.2) --- the primary safety control given the static-content model.

-   A user-facing "report this Wisdom" flow for parents, feeding a fast-track re-review process even post-publication.

-   Periodic content audits (e.g., quarterly sampling across all seven categories) to catch drift in tone, accuracy, or age-appropriateness as the library scales.

8\. Parent Experience

Deliberately lightweight --- visibility, not a curriculum-tracking dashboard.

-   What's been completed: a simple, readable list or summary of Wisdoms completed recently, by category --- not a graded report.

-   Favorited Wisdoms: visibility into what the child chose to bookmark, which is often a more interesting signal of genuine interest than completion alone.

-   Simple discussion prompts (optional): a short, occasional suggestion tied to a recently completed Wisdom ("Ask them what they'd do if a friend left them out --- they just read about this"), designed to be skippable and low-effort, not a structured requirement.

-   Minimal notifications: no daily nag notifications about the child's activity; at most an occasional, low-frequency digest --- consistent with the app's calm, low-pressure positioning.

-   Account and subscription management: managing child profiles, subscription tier, and data/privacy controls.

9\. Mobile App Structure (iOS & Android)

Visual direction for every screen below: restrained, muted color palette; elegant, editorial typography; tasteful illustration rather than cartoon mascots; generous white space; calm UI chrome. Progress and gamified unlocking should read through clean iconography and layout, not bright colors, badges, or arcade-style animation --- the goal is a premium children's-book feel crossed with a modern minimal app, not a mobile game.

**Category map / home view.** The seven category paths, each rendered as a restrained visual trail (think: an elegant illustrated map or a clean vertical/horizontal path, not a candy-crush-style level map) showing completed, current, and locked-preview Wisdoms per path.

**Wisdom reader.** A clean, book-like reading view for the story/text --- generous margins, considered type, optional audio narration toggle for younger readers, minimal chrome.

**Exercise flow.** One exercise at a time, calm transitions, clear but understated correct/incorrect feedback (no arcade sound/animation), a simple completion state at the end of the set.

**Favorites / library view.** A browsable, searchable personal collection of favorited and completed Wisdoms --- the "growing bookshelf" view, visually distinct from the forward-looking path view to reinforce the reference-library framing (Section 4.5).

**Progress / momentum view.** A quiet, non-numeric-streak way to see consistency over time (see Section 4.4) --- framed as a gentle reflection of engagement, not a scoreboard.

**Parent view.** PIN/biometric-gated, separate from the child's session; houses the visibility and settings described in Section 8.

**Onboarding.** Parent account creation and consent flow → child profile creation (name, age/birthdate) → a brief, calm intro to how the app works (today's Wisdom, unlocking, favorites) → placement into an appropriate starting point per category based on age.

10\. Success Metrics

Metrics are oriented around a daily-habit, low-pressure product --- not multi-year curriculum completion.

-   Daily active use: proportion of subscribed children opening the app on a given day, and rolling weekly/monthly active rates.

-   Completion rate per Wisdom: proportion of started Wisdoms that reach "done" --- a content-quality signal as much as an engagement one (a poorly written or overly hard Wisdom will show a completion drop).

-   Return consistency (not streak count): days-active-per-week distribution, tracked without surfacing a break-able streak number to the child (Section 4.2) --- the metric is for the product team, not gamified back to the user as pressure.

-   Favorites usage: favorite rate per completed Wisdom, and how often favorited Wisdoms get revisited --- a strong proxy for perceived value, since favoriting and revisiting are voluntary, low-incentive actions.

-   Category breadth: how many of the seven paths a given child engages with, as a signal of whether the multi-path-freedom design (Section 4.3) is working as intended versus users tunneling into one category.

-   Parent-side engagement: parent view open rate and (if introduced) discussion-prompt usage, as a secondary but meaningful signal of household-level value beyond the child's solo usage.

-   Content pipeline health: review turnaround time and rejection/rework rate at human review (Section 6.2), tracked as an operational metric to ensure content supply keeps pace with the unlock cadence.

11\. Monetization Model

Carrying forward the freemium + family subscription direction established for the Luma concept generally, adapted to this content-library product shape.

11.1 Structure

**Free tier.**

-   Full access to one or two categories (e.g., Character Wisdom and Life Wisdom) so a family can experience the complete daily loop --- reading, exercises, unlocking, favoriting --- before paying, rather than a time-limited trial.

-   No ads at any tier, consistent with the child-safety and trust positioning (Section 7).

**Paid tiers.**

  -------------------------- ---------------------------------------------------------------------------------------------- ------------------------------------------------
  **Tier**                   **Scope**                                                                                      **Illustrative pricing (to validate)**
  Individual Child           All seven category paths for one child profile                                                 \~\$6.99--\$8.99/month or \~\$59--\$69/year
  Family Plan                All seven paths for up to 4--5 children under one account, shared parent view                  \~\$10.99--\$13.99/month or \~\$89--\$109/year
  Founding/Annual discount   Early-access pricing lock for launch cohort, annual billing discount (\~20--30% vs. monthly)   Time-boxed launch incentive
  -------------------------- ---------------------------------------------------------------------------------------------- ------------------------------------------------

Pricing is positioned modestly below the earlier, more feature-rich AI-companion concept's illustrative range, reflecting this leaner v1's reduced AI-runtime cost (no live conversational AI) and narrower scope --- but should still be validated with willingness-to-pay research rather than assumed. A content library product without a "live companion" hook may face more direct comparison to one-time-purchase book bundles, so the subscription's value story needs to lean on the ever-growing-library and daily-habit framing (Sections 3--4), not on features a printed book can't match in isolation.

11.2 Other considerations (flagged, not committed for v1)

-   Gifting flow for grandparents/relatives, common in the kids' product category.

-   One-time "category pack" purchases as an alternative/complement to subscription for price-sensitive families --- worth testing against pure subscription.

-   No in-app purchases directed at the child --- all purchasing is parent-facing only.

12\. Roadmap Beyond v1

**Additional categories:** expanding beyond the initial seven pillars as the content pipeline matures (e.g., a dedicated Health & Body Wisdom path, or region-specific civic/life-skills content).

**Teen edition (14--17):** a tonally and topically distinct extension for older teens, addressed as its own design and content effort rather than an extension of the 6--13 experience (see Section 2.1).

**Family challenges:** optional shared activities a parent and child complete together, tied to specific Wisdoms, deepening the household-level value proposition beyond individual child usage.

**Physical/print extensions:** a natural extension given the book-inspired format --- printed or audiobook collections of favorited/top-rated Wisdoms.

**Optional AI companion, added later as an opt-in bonus rather than a core dependency:** once the static-content library and daily-habit mechanics are validated, a conversational layer (echoing the more ambitious concept explored earlier) could be reintroduced as a premium, explicitly opt-in feature --- deliberately sequenced after core-loop validation so v1 doesn't inherit the cost, complexity, and child-safety surface area of live AI conversation before the underlying content product has proven its retention thesis.

**School/teacher edition:** a longer-horizon B2B2C option once the consumer product and content library are mature, similar in spirit to the earlier concept's institutional-channel idea.

13\. Open Questions / Risks

Content pipeline risks

-   AI-generation quality and tonal variety at scale: sustaining the intended mix of tones (funny, curious, safety-serious, reflective, puzzle-like) across a large, continuously growing library is unproven --- there's a real risk of tonal convergence (everything starts sounding the same) as generation volume increases, which the review checklist (Section 6.2) is designed to catch but hasn't been tested at scale.

-   Originality risk: even with explicit instructions to treat existing books as tonal inspiration only, AI generation carries some risk of producing content that echoes a source too closely (plot structure, specific phrasing, distinctive examples); the human review step needs a concrete, checkable originality standard, not just a general instruction, and legal review of that standard is advisable before scaling content production.

-   Review throughput as a bottleneck: the daily-unlock mechanic (Section 4) depends on a healthy content backlog; if human review capacity doesn't scale with the number of active category paths and users, the pipeline --- not the product mechanic --- becomes the growth constraint.

Product/retention risks

-   Daily-habit retention is unproven at this scale and pressure level: removing the aggressive streak/loss-aversion mechanics that make competitor apps "sticky" is a deliberate, values-driven bet, but it's untested whether a calmer mechanic sustains daily engagement as well as a harsher one --- this is worth early cohort testing rather than assuming the calmer approach "just works" as well commercially.

-   Multi-path freedom vs. engagement depth: letting children roam freely across all seven paths (Section 4.3) avoids feeling blocked but could also thin out engagement per category if children skim across many paths shallowly rather than building a deep collection in any one --- worth watching in the category-breadth metric (Section 10).

-   Visual differentiation is a real market bet: research suggests mascot-driven, character-heavy design is currently a strong commercial pattern in kids' apps (Duolingo's owl being the reference case); Luma's explicit rejection of that language is a considered brand bet for trust and differentiation, but it runs against a documented market trend and should be validated with parent and child usability testing, not assumed to be self-evidently the right call.

Safety and compliance risks

-   Even without live AI chat, AI-generated content aimed at children carries reputational and safety risk if the review gate fails on an edge case (e.g., a safety-related Street Wisdom entry with subtly incorrect guidance) --- this argues for treating human review as a genuinely resourced function, not a lightweight rubber stamp, especially for the Street Wisdom and Modern World Wisdom categories.

-   Regulatory motion: as with the broader Luma concept, children's privacy law is actively evolving (amended COPPA obligations landing April 2026, UK Article 25 binding design requirements); this PRD reflects the landscape as of mid-2026 and should be revisited on an ongoing compliance calendar.

Assumptions flagged in this PRD

-   Market/monetization assumptions (global-first compliance posture, freemium + family subscription model) are carried over from the earlier Luma PRD discussion rather than re-confirmed for this specific concept --- worth a quick explicit check given the product shape has changed meaningfully.

-   Pricing in Section 11 is illustrative and lower than the earlier concept's range to reflect reduced AI-runtime costs, but is not validated with primary research.

-   This PRD treats v1's target age range as roughly 6--13 based on the concept brief's content and tone description; if a narrower or wider range is intended, content volume and design assumptions in Sections 5 and 9 should be revisited accordingly.

*End of document.*
