# Notes for AI coding agents

- Debugging or updating the API test (TC3)? Follow `.claude/skills/debug-api-test/SKILL.md`.
- Web tests use the Page Object Model in `pages/`. Keep locators there, not in the specs.
- Prefer user-facing locators (`getByRole`, `getByTestId`) over CSS classes; DDG's class names are generated and change.
- Run `npx tsc --noEmit` and `npx playwright test` before you finish.
