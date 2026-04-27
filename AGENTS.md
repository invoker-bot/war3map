# Repository Guidelines

## Project Structure & Module Organization

This repository is a TypeScript library for translating Warcraft III `war3map`
files to and from JSON-like structures. Source modules live in `src/`, with
`src/index.ts` exporting the public API. Unit tests live in `test/` and use
fixture map files under `test/map1/` and `test/map2/`. Generated API
documentation is stored in `docs/`; update it with TypeDoc when public APIs
change rather than editing generated HTML by hand.

## Build, Test, and Development Commands

Run `npm install` before local development to install the pinned dependencies in
`package-lock.json`.

- `npm test`: runs Jest tests through `ts-jest`.
- `npm run test:watch`: runs Jest in watch mode during development.
- `npm run test:coverage`: produces coverage output in `coverage/`.
- `npm run build`: compiles TypeScript with `tsc -p tsconfig.json` into `dist/`.
- `npm run lint`: checks all `.ts` files with ESLint.
- `npm run doc`: regenerates TypeDoc output in `docs/`.

## Coding Style & Naming Conventions

Use TypeScript and keep modules focused on one Warcraft III file/object domain,
following existing names such as `BinaryBuffer.ts`, `DoodadsObject.ts`, and
`RegionObject.ts`. `.editorconfig` requires UTF-8, LF line endings, final
newlines, trimmed trailing whitespace, and 2-space indentation for
`js`, `json`, `ts`, and `yml` files. ESLint uses `@typescript-eslint`,
`eslint-plugin-jest`, and Prettier-compatible rules; run `npm run lint` before
submitting changes.

## Testing Guidelines

Tests use Jest with Node as the test environment. Name test files with
`.test.ts` or `.spec.ts`; current examples include `BinaryBuffer.test.ts` and
`MapObject.test.ts`. Keep binary fixture data in `test/map*/` and avoid mutating
fixtures in place. Add or update tests when changing parsing, serialization, or
binary buffer behavior, and run `npm test` plus `npm run test:coverage` for
behavioral changes.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Fix import bugs.` and
`Add RegionObject support.` Keep commit subjects concise and focused on one
change. Pull requests should describe the changed map formats or APIs, list
commands run, link related issues, and include regenerated docs when public API
changes affect `docs/`.

## Security & Configuration Tips

Do not commit local coverage output, build artifacts outside the intended
package files, editor state, or private map data. Treat fixture `.w3*`, `.doo`,
`.shd`, and `.wpm` files as test inputs and keep any proprietary maps out of the
repository.
