# Contributing to Shared Kingdom

Thanks for your interest in improving Shared Kingdom! This document outlines how to get set up locally, propose changes, and submit pull requests that are easy to review.

## Prerequisites

* Node.js 18 or newer
* npm 9 or newer
* Git

## Repository Layout

```
apps/client   # Babylon.js web client
apps/server   # Colyseus authoritative server
packages/shared  # Shared TypeScript contracts and utilities
```

## Development Workflow

1. **Fork and clone** the repository.
2. **Create a feature branch** from `main`: `git checkout -b feature/my-change`.
3. **Install dependencies** in each workspace you modify, e.g. `npm install` inside `apps/client`.
4. **Run the relevant checks** before opening a pull request:
   * `npm run typecheck` (client and/or server)
   * `npm run build` (client)
5. **Open a pull request** against `main` with a concise summary of the change and testing evidence.

## Coding Guidelines

* Prefer TypeScript for new code.
* Keep shared message schemas and constants in `packages/shared` to avoid divergence.
* Document non-trivial logic with inline comments or module-level README files.
* Ensure new files include the necessary imports rather than relying on globals.

## Commit Messages

* Use present-tense imperative verbs (e.g., `add`, `fix`, `update`).
* Group logically related changes into a single commit when possible.

## Issue Reporting

* Use the issue templates provided under `.github/ISSUE_TEMPLATE/`.
* Include reproduction steps, expected vs actual behavior, and environment details.

## Community Expectations

By participating in this project you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to the maintainers listed in the repository.
