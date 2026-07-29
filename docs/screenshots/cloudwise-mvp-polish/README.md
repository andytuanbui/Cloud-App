# CloudWise MVP polish screenshots

Captured from the Expo web build during responsive validation.

- `01-today-fresh-390x844.png`
- `02-today-in-progress-390x844.png`
- `03-today-completed-390x844.png`
- `04-opening-question-390x844.png`
- `05-read-390x844.png`
- `06-talk-with-cloud-375x667.png`
- `07-reflect-375x667.png`
- `08-practice-375x667.png`
- `09-quiz-correct-feedback-375x667.png`
- `10-quiz-incorrect-feedback-375x667.png`
- `11-completion-375x667.png`
- `12-small-screen-today-fresh-375x667.png`

The Today screen was also checked at 430 × 932. All production routes were
checked with the bottom navigation anchored to the viewport.

## Development reset

The reset is available only when `__DEV__` is true and never appears in the
child interface.

- Web startup: open `http://localhost:8081/?resetCloudwise=1`.
- Development console: run `await globalThis.__cloudwiseReset()`, then reload.

Both methods restore the default Alex profile and clear all Wisdom progress.
