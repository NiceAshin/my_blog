# Repository Guidelines

## Project Structure & Module Organization
This repository is a VuePress 1 documentation site. Top-level folders such as `ai/`, `ddd/`, `java/`, `go/`, `laravel12/`, and `cloud-native/` contain topic-based Markdown content. Each section uses a `README.md` as its landing page. Site configuration lives in `.vuepress/config.js`, navigation is defined in `.vuepress/nav/zh.js`, shared assets are under `.vuepress/public/`, and theme overrides live in `.vuepress/styles/`. GitHub Actions deployment is configured in `.github/workflows/docs.yml`.

## Build, Test, and Development Commands
- `npm install` — install VuePress and theme dependencies.
- `npm run dev` — start the local docs server at `http://localhost:8080` with live reload.
- `npm run build` — generate the production site into `.vuepress/dist`.

Use Node.js 16 to match the CI workflow.

## Coding Style & Naming Conventions
Use 2-space indentation in JavaScript config files and keep the existing CommonJS style (`module.exports`, `require(...)`). New content files should be Markdown with YAML front matter, for example:

```md
---
title: Example Title
date: 2026-03-31
categories:
  - AI
---
```

Prefer lowercase kebab-case for article filenames such as `object-tracking-guide.md`. Keep section index pages named `README.md`. When adding or renaming pages, update `.vuepress/nav/zh.js` so navigation links stay valid.

## Testing Guidelines
There is no separate automated test suite in this repo. The main validation step is `npm run build`; contributors should treat a successful build as required before opening a PR. For navigation, layout, or asset changes, also verify the page locally with `npm run dev`.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit-style prefixes such as `docs(ai): ...`, `fix(php): ...`, and `feat(nav): ...`. Continue using `type(scope): summary` with clear scopes tied to sections or site areas.

Pull requests should include a short description, the folders or pages changed, and screenshots for visible UI or navigation updates. Link related issues when applicable, and confirm that `npm run build` passes before requesting review.

## Content & Configuration Notes
Preserve existing routes and relative links where possible; broken links will surface during build or manual review. Do not commit secrets—deployment credentials are provided through GitHub Actions secrets only.
