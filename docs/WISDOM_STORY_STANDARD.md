# CloudWise Wisdom Story Standard

## Purpose and target

A Wisdom Story should normally take **3–5 minutes of authored narration** at a clear, age-appropriate pace. The target exists to give a child time to care about the situation before Cloud asks them to think about it. Length is never a reason to add filler.

Story comes before explanation. Let the child experience the character’s wants, relationships, tension, and uncertainty before Cloud names or teaches the Wisdom. The Story should end with room for the child to form an opinion, then hand off naturally to Talk with Cloud.

## Flexible story shape

Use only the beats the story needs, usually in this direction:

1. Open with a relatable moment or a question that creates curiosity.
2. Establish what the child character wants and why it feels important.
3. Introduce another person, need, or future goal that genuinely matters.
4. Increase the internal or social tension between the possibilities.
5. Give the character a real pause or decision point.
6. Show or imply what each direction could change.
7. Stop before explaining the lesson or declaring one answer correct.
8. Invite the child into Talk with Cloud through the unresolved thought.

This is not a fixed screen count. Production content stores ordered narrative beats separately from reusable visual scenes. Several beats may share one illustration, and a new illustration should exist only when the visual meaning changes.

## Language and narration

- Write for the Wisdom’s declared age range; the first reference Wisdom targets ages 8–11.
- Prefer short, natural sentences and concrete words. Explain an unfamiliar idea through context rather than a definition.
- Read dialogue aloud only when it reveals a relationship, desire, or pressure. Keep speakers unmistakable.
- Use sensory detail when it helps the child enter the moment: one clear sound, texture, movement, or image is usually enough.
- Use internal thought to make competing feelings understandable, not to deliver Cloud’s teaching in the character’s voice.
- Avoid moralizing, abstract category labels inside the Story, rhetorical lectures, and an obviously “correct” option.
- Vary sentence length gently. Give important choices and emotional turns space to land.

## Pacing and the duration guard

The deterministic production estimate counts words in every `storyBeats[].narrationText` value and divides by **110 words per minute**, a deliberate read-aloud pace for clear narration to children aged 8–11. UI labels, child response time, and Talk with Cloud are excluded. Tests should keep the estimate from 3:00 through 5:00 inclusive.

Use the estimate as a guard, then read the Story aloud. Remove repeated information, decorative detours, and explanations the scene already makes clear. Add material only when it deepens desire, relationship, tension, consequence, curiosity, or reflection.

## Talk with Cloud handoff

The final beat should leave the central decision open. A direct question can help, but the Story must not answer it first. Talk with Cloud may then help the child notice feelings, trade-offs, and consequences without shaming a response or treating one allocation as universally right.

## Accessibility and readability

- Keep each displayed beat brief enough to scan on a phone without shrinking type; split at a meaningful pause, not an arbitrary word count.
- Match visible text and narration in meaning. Narration may expand pronunciation or clarity, but must not introduce a hidden lesson.
- Provide a concise visual accessibility label that adds useful information without repeating the full story text.
- Keep live text out of artwork and maintain approved contrast, type, spacing, and 44 × 44 minimum touch targets.
- Support scrolling and text enlargement without clipping. Navigation must always identify the current part, the way back, and the next action.
- Do not rely on color, audio, or an illustration alone to communicate a required story fact.
