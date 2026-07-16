All AI contributors must read this document before making related changes.

# Content Architecture

CloudWise content is modeled as independent records. Screens should never import raw content files directly. Screens ask services for content, and services decide whether the source is local static data today, Supabase later, or cached offline content in the future.

## Core Rule

Raw content lives in `src/content/wisdom.ts`.

App code reads it through:

- `src/services/contentService.ts` for domain records.
- `src/services/wisdomService.ts` for UI-ready view models used by the current prototype.

Do not import `src/content/wisdom.ts` from a screen or component.

## Data Model

`Category` describes a learning world:

- `id`
- `title`
- `shortTitle`
- `icon`
- `color`
- `description`
- presentation fields for the current local prototype: `image`, `background`, `heroColors`, `lockedColors`

`Wisdom` describes one independent lesson:

- `id`
- `categoryId`
- `title`
- `subtitle`
- `coverImage`
- `estimatedMinutes`
- `difficulty`
- `becomingTitle`
- `nextIdentity`
- `storyId`
- `challengeId`
- `conversationId`
- `rewardId`
- `order`
- `isPremium`
- `tags`
- `status`
- `locale`

`Story` contains page-by-page storybook content:

- `id`
- `wisdomId`
- `pages[]`

`StoryPage` supports the interactive storybook:

- `id`
- `wisdomId`
- `image`
- `eyebrow`
- `title`
- `body`
- `emotion`
- `interactionType`
- optional `choiceOptions`
- optional `branchId`
- optional `buttonLabel`

`Challenge` contains real-life practice:

- `id`
- `wisdomId`
- `title`
- `description`
- `steps[]`

`Conversation` contains the safe scripted Talk with Cloud seed:

- `id`
- `wisdomId`
- `openingQuestion`
- `suggestedReplies[]`

## Adding A New Wisdom

1. Add or reuse a `Category` in `src/content/wisdom.ts`.
2. Add one `Wisdom` object with a stable `id`.
3. Set `categoryId` to the category it belongs to.
4. Give it `storyId`, `challengeId`, `conversationId`, and `rewardId`.
5. Add a matching `Story`.
6. Add a matching `Challenge`.
7. Add a matching `Conversation`.
8. Add a matching `Reward`.
9. Run `npm run typecheck`.

No screen should need to change for a normal new wisdom.

## Story Choices

For a choice moment, create a page with `interactionType: 'choice'` and `choiceOptions`.

Each choice option should include a `branchId`. Pages that belong to that branch use the same `branchId`. Pages without a `branchId` are shared by every path.

This lets one story support:

- shared opening pages
- one choice moment
- selected consequence pages
- shared reflection, challenge, and becoming pages

## Service API

Use `contentService.ts` for domain content:

- `getCategories()`
- `getCategory(id)`
- `getWisdom(id)`
- `getWisdomsForCategory(categoryId)`
- `getStory(id)`
- `getChallenge(id)`
- `getConversation(id)`

Use `wisdomService.ts` only when a current screen needs prototype-specific view data such as Home worlds, recommended cards, or Cloud images.

## Future Readiness

This architecture is designed so the source can change later without rewriting screens:

- Supabase can replace local arrays behind `contentService.ts`.
- Offline mode can cache service responses.
- Localization can use `locale` on content records.
- Premium access can use `isPremium`.
- AI conversation can attach safely to `conversationId` and `wisdomId`.
- Cloud memory can attach to completed wisdom IDs and conversation summaries.

Keep content, services, and screens separate. That separation is what lets CloudWise grow from one prototype story to thousands of wisdoms without rebuilding the app every sprint.
