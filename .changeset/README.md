# Changesets

This directory stores release notes for the publishable packages in this repo.

The current publish flow covers:

- `@slidev-react/core`
- `@slidev-react/node`
- `@slidev-react/cli`

`@slidev-react/client` stays private and is ignored by Changesets.

Typical flow:

1. Run `pnpm changeset`
2. Select the packages that should be versioned
3. Describe the change in a short note
4. Merge to `main`
5. Let the release workflow open or update the release PR
6. Merge the release PR to publish to npm
