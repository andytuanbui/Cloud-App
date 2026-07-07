TITLE: Luma — Product Requirements Document (v1.0)
Subtitle: An AI-Powered Life Academy for Children Ages 5–17
Doc owner: Andy | Status: Draft for review | Date: July 2, 2026

---

# 1. Executive Summary

**The problem.** Schools teach children algebra, grammar, and photosynthesis, but rarely teach them how money actually works, how to spot manipulation, how to think critically about information, how to communicate under conflict, or how to build character. Parents know these gaps exist — most say they wish they'd been taught this themselves — but few have the time, curriculum, or expertise to teach it consistently at home. The result is a generation of young adults who reach 18 financially illiterate, vulnerable to scams and social pressure, and under-practiced in the judgment calls that adult life demands daily.

**The mission.** Help parents raise children who are curious, confident, trustworthy, financially wise, and prepared for life — not through lectures or memorization, but through stories, AI conversations, reflection, and real-life practice.

**The one-line pitch.** Luma is an AI-powered Life Academy that helps parents raise wiser, more capable children by teaching the practical wisdom many adults wish they had learned growing up.

**The approach.** Luma pairs a structured, age-progressive curriculum spanning seven "wisdom" pillars with an AI companion, Cloud, who guides each child through a repeatable learning loop: a relatable story, a Socratic conversation, personal reflection, a clearly stated principle, a real-life challenge, and a spaced-repetition revisit weeks later. Children can start as young as 5 and grow with Luma through age 17, with the same companion remembering their journey the whole way. Parents get visibility into what their child is learning and are prompted with discussion starters to bring the lessons home.

**Why now.** Conversational AI has finally reached a point where an AI companion can hold an age-appropriate, safety-guardrailed, genuinely Socratic conversation with a 7-year-old or a 16-year-old — something static apps, books, or video curricula could never do. That capability, combined with rising parental anxiety about phones, social media, AI, and financial literacy gaps, creates the opening for a category-defining "life skills" platform, distinct from both academic ed-tech (Khan Academy, Duolingo) and kids' banking apps (Greenlight, Acorns Early), which teach transactional money mechanics but not judgment, character, or critical thinking.

---

# 2. Target Users

## 2.1 Child personas by age band

**Ages 5–7 — "The Little Learner"**
Concrete thinker, learns through play, stories, and repetition. Cannot yet reason abstractly about risk or long-term consequences. Motivated by praise, characters, and short wins. Screen time is parent-supervised. Reading ability is emerging — content must work read-aloud/audio-first with simple text and big visuals.
Representative child: Maya, 6, loves animal characters, is learning to share her toys and tell the truth even when it's hard.

**Ages 8–10 — "The Builder"**
Beginning to grasp cause-and-effect, delayed gratification, and simple money concepts (saving vs. spending). Reads independently. Increasingly aware of friendships, fairness, and rules. Wants a sense of ownership and competence ("I did this myself"). First exposure to devices/apps of their own.
Representative child: Eli, 9, just got his first allowance and wants to save for a bike, but keeps spending on snacks.

**Ages 11–13 — "The Explorer"**
Entering abstract reasoning; can debate, question authority, and start to see nuance. Social pressure intensifies (peer approval, first phone, first social app accounts). Identity formation begins. Susceptible to online manipulation, comparison, and misinformation. Wants autonomy but still needs guardrails.
Representative child: Priya, 12, just got her first smartphone and is navigating group chats, comparison on social media, and her first experience with online strangers.

**Ages 14–17 — "The Almost-Adult"**
Capable of sophisticated abstract and hypothetical reasoning. Preparing for real independence: first job, first bank account, driving, college or career decisions, dating, and contracts (leases, terms of service). Wants to be treated as a near-adult, not lectured. Highly sensitive to being condescended to — tone must shift to peer-like mentorship.
Representative teen: Jordan, 16, has a part-time job, is opening a checking account, and is trying to figure out whether the "guaranteed returns" investment a friend told him about is a scam.

## 2.2 Parent persona

**"The Intentional Parent" — primary persona.**
Age 32–48, household income supports discretionary spending on children's development ($10–40/month range for a subscription feels reasonable if value is clear). Already invests in enrichment (sports, tutoring, camps) and increasingly in digital literacy/safety tools. Time-constrained; wants high-leverage tools, not more homework for themselves. Anxious about phones, social media, AI, and financial illiteracy but doesn't have a structured way to address it. Wants to be involved but not have to be the curriculum designer — wants Luma to do the "what to teach and when," while parents handle "the how do we talk about it at dinner."

Secondary personas worth noting for later roadmap (not primary v1 design targets): homeschooling parents (want more curriculum depth/reporting), grandparents/guardians, and school counselors/teachers (see Section 12).

---

# 3. The "Luma Graduate" — North Star Profile

Everything in the curriculum should point toward producing this outcome by age 18. This profile is the design compass: when in doubt about what a lesson should accomplish, ask "does this move a child closer to becoming this person?"

**How they think.** They pause before reacting. When they hear a claim — from an ad, a headline, a friend, or an AI chatbot — their first instinct is "who benefits if I believe this, and what's the evidence?" They're comfortable saying "I don't know yet, let me find out" rather than guessing to save face. They can hold two opposing views in mind at once and evaluate both fairly before forming their own.

**How they handle money.** They've internalized the difference between wants and needs, understand that money is a tool for goals rather than a scoreboard, and have practiced saving, budgeting, and the mechanics of interest and investing long before their first real paycheck. They know what a scam sounds like — a stranger offering guaranteed returns, urgency, secrecy — because they practiced spotting them as a game, not just being told to worry.

**How they treat others.** They keep their word. They can disagree with someone without attacking them, and apologize without collapsing into shame. They notice when someone is being excluded and do something about it. They negotiate — for a raise, a price, a curfew — by understanding the other side's interests, not just pushing harder.

**How they make decisions.** They default to asking a few clarifying questions before committing to anything irreversible. They can tell the difference between a decision that needs five minutes and one that needs five days. They've built a track record of following through on small commitments to themselves, which gives them real (not performative) self-confidence.

**How they handle the digital and modern world.** They understand that algorithms are optimized for engagement, not their wellbeing, and adjust their behavior accordingly. They know how to verify a claim, spot an AI-generated fake, and protect their privacy online without becoming paranoid or isolated. They use AI tools as capable assistants, not oracles — they still form their own judgment.

**How they carry themselves.** Quietly confident rather than boastful. Resilient after setbacks because they've had structured practice failing safely and reflecting on it. Curious by default — they ask "why" and "how do you know that" as a habit, not an interrogation.

This is deliberately an aspirational, values-forward profile — not a checklist of "completed lessons." Section 10 (Success Metrics) operationalizes it into observable, measurable behaviors.

---

# 4. Curriculum Architecture

## 4.1 Design principles

- **Spiral, not linear.** Each pillar is revisited at every age band with increasing complexity — a child doesn't "finish" Money Wisdom at 8 and move on; they return to money concepts at 11 and 14 with more sophistication, building on stored memory of earlier lessons.
- **Concrete before abstract.** Ages 5–10 teach through characters, stories, and direct experience. Ages 11+ introduce explicit frameworks, vocabulary, and debate.
- **Practice over theory.** Every unit ends in a real-life challenge, not just a quiz. Wisdom is behavioral, not declarative.
- **Parent-amplified, not parent-replaced.** The curriculum assumes the richest learning happens when the AI lesson becomes a kitchen-table conversation — see Section 7.

## 4.2 The seven pillars

1. **Street Wisdom** — safety, recognizing manipulation, trusting instincts, situational awareness
2. **Money Wisdom** — saving, investing, budgeting, delayed gratification, entrepreneurship
3. **Thinking Wisdom** — critical thinking, decision-making, evaluating information, bias
4. **People Wisdom** — trust, friendship, communication, negotiation, leadership
5. **Character Wisdom** — integrity, responsibility, courage, discipline, resilience
6. **Modern World Wisdom** — AI literacy, digital privacy, online safety, misinformation
7. **Life Wisdom** — practical adulthood knowledge (taxes, contracts, cooking, health, civic basics)

## 4.3 Curriculum matrix — example lesson topics by pillar × age band

### Street Wisdom

| Age band | Example lesson topics |
|---|---|
| 5–7 | Stranger danger basics; "my body, my rules"; who is a "helper" (police, teacher) vs. a stranger; what to do if lost in a store |
| 8–10 | Recognizing peer pressure; safe vs. unsafe secrets; trusting the "uh-oh" feeling in your gut; basic street/bike safety |
| 11–13 | Spotting manipulation tactics (flattery, guilt, urgency); grooming red flags (age-appropriate, non-graphic); safe use of public spaces and transit |
| 14–17 | De-escalating confrontation; recognizing coercive control in early dating; scam and trafficking red flags; situational awareness at parties/night out |

### Money Wisdom

| Age band | Example lesson topics |
|---|---|
| 5–7 | What money is for; earning vs. finding vs. being given; saving in a jar; needs vs. wants |
| 8–10 | Allowance and budgeting basics; saving toward a goal; the idea of "paying yourself first"; simple entrepreneurship (lemonade stand economics) |
| 11–13 | Compound interest and why it matters; comparing prices/value; intro to saving accounts; spotting bad deals and hidden fees |
| 14–17 | Investing basics (stocks, index funds, risk); budgeting a first paycheck; credit and debt; taxes 101; negotiating pay; building a small business/side hustle |

### Thinking Wisdom

| Age band | Example lesson topics |
|---|---|
| 5–7 | Cause and effect through stories; "is that true or pretend?"; simple sorting/classifying games |
| 8–10 | Fact vs. opinion; asking "how do you know?"; simple logic puzzles; considering more than one solution |
| 11–13 | Spotting bias in a story or ad; evaluating sources; understanding statistics vs. anecdotes; intro to logical fallacies |
| 14–17 | Debate and argument construction; cognitive biases (confirmation bias, sunk cost); evaluating AI-generated content critically; long-term decision frameworks |

### People Wisdom

| Age band | Example lesson topics |
|---|---|
| 5–7 | Sharing and taking turns; saying sorry and meaning it; identifying feelings in self and others |
| 8–10 | Making and keeping friends; handling teasing/conflict; active listening basics |
| 11–13 | Navigating group dynamics and exclusion; healthy vs. unhealthy friendships; intro to negotiation (trading, compromise) |
| 14–17 | Communicating under conflict; negotiating (pay, curfew, deals); leadership and delegation; healthy romantic relationship basics; giving/receiving feedback |

### Character Wisdom

| Age band | Example lesson topics |
|---|---|
| 5–7 | Telling the truth even when it's hard; following through on small promises; being brave in small ways |
| 8–10 | Responsibility for chores/homework; handling losing gracefully; discipline through small daily habits |
| 11–13 | Integrity when no one is watching; courage to disagree with a friend group; managing frustration and impulse |
| 14–17 | Resilience after failure/rejection; long-term discipline (goals over months, not days); ethical decision-making under pressure |

### Modern World Wisdom

| Age band | Example lesson topics |
|---|---|
| 5–7 | Screens have a stop time; not everyone online is who they say; asking a grown-up before clicking |
| 8–10 | What "private" information is; basics of how apps/games try to keep your attention; talking to an AI chatbot safely |
| 11–13 | Social media and comparison; spotting fake images/deepfakes; digital footprint; cyberbullying |
| 14–17 | AI literacy (how AI models work, their limits/biases); misinformation and media literacy; online reputation and privacy; scams targeting teens |

### Life Wisdom

| Age band | Example lesson topics |
|---|---|
| 5–7 | Basic hygiene and self-care routines; simple cooking/kitchen safety; taking care of belongings |
| 8–10 | Time management basics; simple meal prep; basic first aid awareness |
| 11–13 | Study skills and goal-setting; understanding a paycheck/pay stub concept; healthy habits (sleep, nutrition, exercise) |
| 14–17 | Taxes, contracts, and leases 101; renting/roommates; voting and civic basics; job interviews and resumes; healthcare/insurance basics; cooking and independent living |

---

# 5. Core Learning Loop

Every lesson in Luma — regardless of pillar or age — follows the same seven-step loop. Consistency of structure lets children (and parents) build a mental model of "how Luma lessons work," while content and tone scale with age.

1. **Story.** A short, relatable narrative (illustrated for younger bands, text/audio for older) puts a character in a situation tied to the lesson's principle — e.g., a character is offered a "too good to be true" deal, or has to decide whether to tell a friend an uncomfortable truth. Runtime: 1–3 minutes for younger bands, up to 5 for teens.
2. **Cloud conversation.** Cloud, the AI companion, asks open-ended, Socratic questions about the story rather than stating the moral: "What do you think Maya should do?" "Why do you think the stranger said that?" The child responds via voice or simple text/tap choices (younger bands lean voice + multiple choice; older bands allow free text). Cloud never scores this step — it's exploratory.
3. **Reflection.** The child is prompted to connect the story to their own life: "Has anything like this happened to you?" "How did it feel?" Answers are saved to the child's private journal, visible to parents in summary form (not verbatim for teens, to preserve a degree of psychological safety — see Section 7).
4. **Principle.** Cloud distills the lesson into one clear, memorable statement ("Trust the feeling in your stomach before you trust a stranger's words") and briefly explains the reasoning, tailored to the age band's cognitive level.
5. **Real-life challenge.** A concrete, time-bound task in the physical world — not another screen activity — e.g., "This week, save $2 instead of spending it, and tell Cloud how it felt," or "Practice saying 'no' out loud to a made-up ask, then try it for real if the chance comes up." Challenges are logged by the child (photo, voice note, or parent confirmation for younger kids) and reviewed by Cloud.
6. **Quiz.** A short, low-stakes comprehension check (3–5 questions) — deliberately framed as a game, not a test, with no punitive scoring. Used for mastery tracking, not to gate progress harshly.
7. **Spaced revisit.** Cloud resurfaces the lesson's core principle 1 week, 1 month, and ~6 months later in brief "check-in" moments woven into future sessions ("Remember when we talked about the stomach feeling? Tell me about a time it came up again"), reinforcing retention and letting Cloud observe behavior change over time rather than one-time completion.

**Session cadence:** designed for short daily or near-daily sessions (5–12 minutes depending on age), not long binge sessions — deliberately fighting the "engagement-maximizing" pattern of most kids' apps in favor of a healthy habit loop (see Section 6 guardrails and Section 9 on avoiding dark patterns).

---

# 6. Cloud (AI Companion) Design

## 6.1 Personality

Cloud is warm, curious, encouraging, and non-judgmental — modeled on the best real-life mentor, not a teacher or a parent. Cloud does not lecture. Cloud asks, listens, challenges gently, celebrates specifically (not generically — "You saved $3 instead of buying the toy, that took real discipline" rather than "Great job!"), and remembers. Cloud is allowed to be playful with younger children and more direct/peer-like with teens, but is never sarcastic, never shaming, and never uses guilt as a motivator.

## 6.2 Conversation style

- **Questions before answers.** Cloud's default move is a follow-up question, not a statement. It only states the "principle" explicitly at the end of a lesson.
- **Validates before redirecting.** If a child gives an answer that's off-track, Cloud acknowledges the reasoning behind it before offering a different angle, rather than declaring the child "wrong."
- **No lecturing loops.** Cloud caps how many consecutive questions it asks before offering to move on, to avoid feeling like an interrogation, especially for younger or more anxious children.

## 6.3 Memory and continuity across years

Cloud maintains a longitudinal profile per child: completed lessons, recurring themes the child struggles with or excels at, real-life challenge outcomes, and notable reflections (with sensitive content redacted/summarized rather than stored verbatim beyond a defined retention window — see Section 9). This lets Cloud reference the past organically ("Two years ago you told me you had trouble saying no to your friends — has that gotten easier?"), which is central to the product's differentiation: a companion that grows with the child rather than a stateless chatbot.

Memory is age-transition-aware: as a child moves from one age band to the next, Cloud explicitly marks the transition ("You're older now, so we're going to talk about some bigger things") rather than silently changing tone, which helps both child and parent feel the platform is growing with them intentionally.

## 6.4 Age-appropriate tone shifts

| Age band | Cloud's tone |
|---|---|
| 5–7 | Playful, simple sentences, heavy use of characters/imagery, mostly voice-first, multiple-choice responses |
| 8–10 | Encouraging and curious, introduces open text responses, still warm and game-like |
| 11–13 | Respectful of growing autonomy, more debate-style questioning, acknowledges nuance, less "cute" |
| 14–17 | Peer-mentor tone, direct and non-condescending, treats the teen's opinions as worth debating rather than correcting outright |

## 6.5 Guardrails for child safety

- **Scope-limited conversation.** Cloud is constrained to curriculum-relevant topics and general encouragement; it is explicitly not a general-purpose chatbot, a therapist, or a search engine, and will redirect off-scope requests (e.g., help with unrelated homework, or attempts to jailbreak it into other personas).
- **Crisis detection and escalation.** If a child's input suggests self-harm, abuse, or immediate danger, Cloud stops the lesson flow, responds with a calm, non-alarming message, and triggers a parent/guardian notification and, where appropriate, surfaces crisis resources — never attempting to counsel the child through a crisis itself. This logic is reviewed with child-safety and clinical advisors before launch (see Section 13).
- **No unsupervised open-ended chat for younger bands.** Ages 5–7 interact primarily through guided multiple-choice/voice prompts rather than free-form text input, minimizing exposure to unpredictable model behavior.
- **Content moderation layered on both sides.** Input filtering (on what the child sends) and output filtering (on what Cloud generates) run as separate systems, with the output filter specifically tuned for age-appropriateness per band, not just general toxicity.
- **No ads, no data-driven persuasion tactics directed at children** inside the Cloud conversation experience (see Section 11 for how this shapes monetization).
- **Human-in-the-loop content review.** All story/lesson content is human-authored and reviewed (by educators, child psychologists, and safety specialists) before release; Cloud's real-time conversation is AI-generated but constrained by the reviewed lesson script and guardrail system, not fully open-ended generation.

---

# 7. Parent Experience & Dashboard

## 7.1 What parents see

- **Learning snapshot:** pillars and lessons completed, current streak, and a plain-language "what they're working on this week."
- **Strengths & growth areas:** a qualitative, non-gamified view (e.g., "Consistently thoughtful about money trade-offs; still building confidence speaking up in conflict") synthesized from lesson performance and reflections — not a report card or ranking.
- **Real-life challenges completed:** what the child did in the physical world, with parent-confirmable completion for younger bands.
- **Reflection summaries (not verbatim transcripts) for teens:** to respect a growing teen's privacy while still giving parents meaningful visibility — full transcripts are only shown for younger children (age-tiered privacy, detailed in Section 9).
- **Discussion prompts:** short, ready-to-use conversation starters tied to that week's lesson ("Ask your child what they'd do if a friend asked them to keep a secret that felt wrong") — the core mechanism for turning app usage into real family conversations.

## 7.2 How parents engage

- **Parent mode / parent account:** a separate authenticated view (PIN or biometric-gated on shared devices) distinct from the child's session.
- **Weekly digest:** a concise push notification/email summarizing progress and one discussion prompt — designed to be readable in under a minute, not a dashboard parents must remember to check.
- **Optional co-pilot settings:** parents can adjust pacing (faster/slower), temporarily pause sensitive-topic units (e.g., delay early dating content), and set session time limits.
- **Multi-child support:** one parent account manages multiple children, each with their own Cloud relationship and curriculum pace.

## 7.3 Notification & discussion-prompt design

Notifications are deliberately low-frequency and non-manipulative — no streak-shaming, no "your child hasn't opened the app" guilt pushes. The design goal is trust: parents should feel Luma respects their and their child's time, not competes for attention the way social/gaming apps do. Discussion prompts are the primary retention lever for parents (distinct from the child's engagement loop), reinforcing the platform's value beyond the app itself.

---

# 8. Mobile App Structure (iOS & Android)

## 8.1 Core screens/flows

**Onboarding**
- Parent account creation → parent identity/age verification → add child profile(s) (name, age/birthdate, avatar) → brief parent survey (goals, sensitive-topic preferences, existing concerns) → child-facing intro to Cloud (a short, warm "getting to know you" conversation) → placement into the correct age-band curriculum start point.

**Daily lesson (child home)**
- "Today with Cloud" entry point → Story → Conversation → Reflection → Principle → Challenge assignment → Quiz → session close with a small celebratory moment (non-manetized reward, e.g., a badge/growth visual, not a loot-box mechanic).

**Progress / "My Growth" (child-facing)**
- Visual, non-comparative progress view (pillars as a garden/map metaphor rather than leaderboards) — journey-based rather than ranked, avoiding social comparison mechanics inappropriate for a wellbeing-focused product.

**Challenges**
- Active real-life challenge card with instructions, a way to log completion (photo/voice/parent-confirm), and past-challenge history.

**Parent mode**
- PIN/biometric gate → dashboard (Section 7) → settings (pacing, sensitive-topic controls, notification prefs, multiple children, subscription management, data/privacy controls).

**Cloud chat/check-in (secondary, constrained)**
- A lightweight, scope-limited space for the child to revisit past lessons or ask Cloud to recap — not an open chatbot; bounded by the same guardrails as the main lesson flow.

## 8.2 Platform notes

- Native iOS and Android apps (not a wrapped web view) for performance, offline lesson caching (important for households limiting connectivity), push notification reliability, and platform-level parental control integration (Screen Time / Family Link).
- Voice input/output prioritized for the 5–10 age bands given reading-level constraints; text becomes primary for 11+.
- Offline-first for story/lesson content with sync-on-connect for AI conversation and progress data.

---

# 9. Child Safety & Privacy Requirements

## 9.1 Regulatory framework (global-first posture)

Luma is designed to meet the strictest applicable standard across its launch markets by default, rather than maintaining region-specific carve-outs, given the global-from-day-one target market:

- **COPPA (US).** Verifiable parental consent before collecting any personal information from children under 13; this now includes an expanded definition of personal information covering biometric identifiers, per the FTC's amended COPPA Rule (compliance deadline April 22, 2026). Separate, explicit parental consent is required before any child data is used for AI model training or shared with third parties (including advertisers) — Luma's default posture is to never use child conversation data for model training without opt-in, and never share it with advertisers, period. Data retention limits must be published and enforced; indefinite retention is not permitted.
- **UK Children's Code / Age-Appropriate Design Code (ICO).** High-privacy-by-default settings, no profiling or geolocation by default, no "nudge" dark patterns encouraging children to weaken privacy settings, age-appropriate transparency in plain language. As of June 19, 2025 these principles are embedded directly into UK GDPR Article 25 as a binding "data protection by design" requirement, not just a code of practice — Luma treats this as a hard requirement, not guidance.
- **EU GDPR-K (Article 8).** Parental consent required for information society services offered directly to children below the member-state digital consent age (13–16 depending on country); data minimization and purpose limitation apply throughout.
- **Emerging US state laws** (e.g., Maryland Kids Code and similar state-level children's design codes) impose additional design-level obligations (default high privacy, best-interests-of-the-child design standard) that Luma should track on an ongoing compliance calendar, since this is a fast-moving area — see Section 13 risks.

## 9.2 Data handling principles

- **Data minimization by default:** collect only what's needed to run the curriculum and safety systems; no behavioral advertising data collection, ever.
- **Verifiable parental consent (VPC)** at signup, with a compliant consent mechanism (e.g., credit card micro-verification, signed consent form, or knowledge-based verification) before any child account is created.
- **Age-tiered data retention:** conversation transcripts for younger children may be retained in fuller form for parent visibility; for teens (14–17), raw transcripts are retained for a shorter window and parents see AI-generated summaries rather than verbatim logs by default, balancing parental oversight with a teen's developmentally appropriate need for privacy — configurable within limits by parents, with the platform defaulting to the more protective setting.
- **No child data used for AI model training or third-party sharing without separate, explicit, revocable parental opt-in**, consistent with the amended COPPA Rule.
- **Publicly published data retention and deletion policy**, with a working parent-initiated "delete my child's data" flow.
- **Encryption in transit and at rest**, and a written, regularly audited information security program, as now explicitly required under amended COPPA.

## 9.3 Content moderation for AI conversations with minors

- Layered input/output moderation (Section 6.5) tuned per age band.
- Human review sampling of flagged/edge-case conversations (privacy-preserving, aggregate-first review process) to continuously tune the guardrail system.
- A documented crisis-escalation protocol developed with child psychologists/clinical advisors, covering self-harm, abuse disclosure, and immediate danger scenarios, with legal counsel review of mandatory-reporting obligations by jurisdiction.
- Red-teaming of Cloud specifically for jailbreak attempts by children (a distinct threat model from adult-facing chatbot red-teaming) prior to and on an ongoing basis after launch.

---

# 10. Success Metrics

## 10.1 Engagement metrics (leading indicators)

- Weekly active children / weekly active families
- Lesson completion rate per session and per pillar
- Real-life challenge completion rate (a stronger signal than lesson completion alone, since it requires off-app action)
- Parent dashboard weekly open rate and discussion-prompt usage
- Multi-year retention (child cohort retention across age-band transitions) — the single most important long-horizon engagement metric given the "grows with you" thesis
- Subscription retention / churn by tier

## 10.2 Behavior-change indicators (the metrics that actually matter)

Consistent with the product's definition of success ("not completed 100 lessons, but observable behavior change"), Luma should track:

- **Parent-reported behavior change surveys**, administered periodically (e.g., quarterly), asking parents to rate observed change across pillar-aligned behaviors (e.g., "My child pauses to think before making a purchase decision," "My child has told me about noticing a manipulation tactic in real life").
- **Spaced-revisit performance**, i.e., whether a child's application of a principle improves when Cloud resurfaces it weeks/months later versus their original response — a proxy for retention and internalization rather than one-time recall.
- **Self-initiated challenge extension**, i.e., children voluntarily continuing a real-life challenge behavior after the formal challenge window closes (e.g., still tracking savings weeks after the "save $2" challenge ended) — a strong signal of habit formation.
- **Qualitative parent testimonials/case studies**, collected systematically, not just anecdotally, as both a product-improvement input and a marketing asset.
- **Longitudinal cohort study (post-v1 roadmap item)**, ideally in partnership with an academic or child-development research partner, tracking a cohort of long-term users against the "Luma Graduate" profile — this is a multi-year undertaking but would be a powerful differentiator for both efficacy claims and investor confidence.

---

# 11. Monetization Model

Per direction, v1 leads with a **freemium + family subscription** model.

## 11.1 Structure

**Free tier.**
- Access to a limited rotating set of lessons (e.g., 1 pillar fully unlocked, or the first 2 weeks of curriculum) so families can experience the full learning loop before paying.
- Full parent dashboard for the free content, so the value of the discussion-prompt/parent experience is visible pre-paywall.
- No ads, ever, at any tier — free tier is a product-led growth funnel, not an ad-supported product, consistent with the no-behavioral-advertising-to-children stance in Section 9.

**Paid tiers.**

| Tier | Scope | Illustrative pricing (to validate) |
|---|---|---|
| Individual Child | Full 7-pillar curriculum for one child profile | ~$9.99–12.99/month or ~$89–99/year |
| Family Plan | Full curriculum for up to 4–5 children under one account, shared parent dashboard | ~$14.99–19.99/month or ~$129–149/year |
| Founding/Annual discount | Early-access pricing lock for launch cohort, annual billing discount (~20–30% vs. monthly) | Time-boxed launch incentive |

Pricing benchmarked against the kids' financial-education/fintech category (Greenlight's core family plan runs roughly $5.99/month, Acorns Early roughly $8/month) — Luma sits at a premium to pure banking-app competitors given its broader 7-pillar curriculum and AI companion depth, but should be validated with willingness-to-pay research pre-launch rather than assumed.

## 11.2 Other monetization considerations (flagged, not committed for v1)

- **Gifting/grandparent purchase flow** — a family member other than the primary parent purchasing a subscription, common in the kids' product category.
- **School/district licensing** — explicitly deferred to the roadmap (Section 12), not part of v1 consumer pricing.
- **No in-app purchases directed at the child** (no virtual currency, no loot boxes, no child-facing upsell) — all purchasing decisions and prompts are parent-facing only, consistent with dark-pattern avoidance commitments in Sections 6 and 9.

---

# 12. Long-Term Roadmap (Beyond v1)

v1 is the mobile app with the full 7-pillar curriculum across all four age bands, Cloud, and the parent dashboard, as specified above. Beyond v1:

- **Phase 2 — Physical + audio extensions:** printed book editions of favorite Luma stories, audiobook versions for screen-free/car listening, physical "challenge kits" for younger age bands.
- **Phase 3 — Teen-specific standalone edition:** a more independent, less parent-visible product surface for older teens (16–17) as they approach true independence, potentially with its own brand positioning distinct from "kids' app."
- **Phase 4 — Teacher/school edition:** a classroom-adapted version of the curriculum with teacher dashboards, group challenges, and alignment to relevant state/national life-skills or financial-literacy education standards, opening a B2B2C/institutional channel.
- **Phase 5 — Community features:** carefully moderated, age-segmented peer spaces (e.g., teens sharing real-life challenge wins) — high potential value but also the highest incremental safety/moderation burden, so deliberately sequenced after the core product and safety systems are proven at scale.
- **Phase 6 — Platform/API and content licensing:** licensing the curriculum framework or Cloud conversation engine to adjacent partners (children's publishers, family-focused fintech, pediatric/family therapy platforms).

---

# 13. Open Questions / Risks

## Technical risks
- **AI reliability at the guardrail boundary.** Even well-tuned models can produce an inappropriate response to an unexpected child input; the crisis-detection and content-moderation systems (Section 9.3) need to be treated as core infrastructure, not a bolt-on feature, and tested continuously, not just at launch.
- **Latency and offline behavior.** Voice-first conversation for younger children is UX-sensitive to latency; the offline-lesson-caching approach (Section 8) needs a clear degraded-mode design for when AI conversation is unavailable but story/challenge content should still work.
- **Multi-year memory architecture.** Storing and safely using years of longitudinal child data to power Cloud's "remembers you" differentiator is a nontrivial data architecture and privacy-engineering challenge — this needs early technical spike work, not a v1-launch afterthought, given how central it is to the product thesis.

## Safety risks
- **False negatives in crisis detection** (missing a genuine disclosure of harm) carry severe consequences and should be treated as the single highest-priority QA area pre-launch, with clinical/child-safety advisor sign-off, not just an engineering checklist.
- **Sensitive-topic pacing** (e.g., early dating/relationship content, manipulation/grooming red-flag content) requires careful age-gating and parent-configurable pacing (Section 7.2) to avoid introducing topics before a family is ready, while still delivering the content early enough to be protective rather than reactive.
- **Regulatory motion.** Children's privacy law is actively changing (amended COPPA obligations landing April 2026, new UK Article 25 binding design requirements, emerging state-level Kids Codes in the US) — this PRD reflects the landscape as of mid-2026; legal counsel should own an ongoing compliance calendar rather than treating Section 9 as a one-time spec.

## Business risks
- **Willingness to pay vs. free financial-education alternatives.** Some competitors (e.g., free-tier fintech literacy apps, school-provided resources) exist at $0; Luma's premium positioning depends on the AI-companion/7-pillar-curriculum differentiation being clearly felt by parents in the free tier, not just claimed in marketing.
- **Category confusion.** Parents may initially bucket Luma with kids' banking apps (Greenlight, Acorns Early) given the Money Wisdom pillar's visibility; go-to-market positioning needs to clearly differentiate "life education platform" from "debit card with lessons attached."
- **Multi-year retention is unproven at the business-model level.** The "grows with you from 5 to 17" thesis is the product's most powerful differentiator but also its biggest business-model assumption — a 12-year customer relationship has no direct precedent in kids' ed-tech, and churn/re-engagement mechanics across major life transitions (starting school, first phone, moving) need explicit design and testing rather than being assumed to happen naturally.

## Assumptions flagged in this PRD (to validate with the user)
- Pricing figures in Section 11 are illustrative/benchmarked, not validated with primary research.
- The global-first compliance posture (Section 9) assumes launch markets include at minimum the US, UK, and EU; if actual launch geography is narrower, the compliance scope can be trimmed accordingly.
- "v1" as scoped here is the full 7-pillar, 4-age-band curriculum per the brief's explicit instruction to design for the complete vision rather than a stripped-down MVP — this is a substantial content production undertaking (dozens of stories/lessons per pillar per age band) and should be sequenced/staffed accordingly even though it's specified as v1 scope.

---

*End of document.*
