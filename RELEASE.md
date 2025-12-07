# Release Process

This project uses [Release Please](https://github.com/googleapis/release-please) for automated semantic versioning and releases.

## How It Works

1. Merge PRs to `main` using Conventional Commits
2. Release Please creates/updates a persistent "Release PR" with version bump + changelog
3. Merge the Release PR when ready to publish
4. GitHub Release is created automatically with release notes

## Conventional Commits

All commits merged to `main` must follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Version Bump Rules

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | Minor (0.1.0 → 0.2.0) | `feat: add batch processing support` |
| `fix:` | Patch (0.1.0 → 0.1.1) | `fix: handle null scores gracefully` |
| `feat!:` | Major (0.1.0 → 1.0.0) | `feat!: change API response format` |
| `BREAKING CHANGE:` in footer | Major | Any commit with breaking change footer |

### No Version Bump

These types are recorded in changelog but don't trigger releases:

- `chore:` - maintenance tasks
- `docs:` - documentation only
- `style:` - formatting, no code change
- `refactor:` - code change without feature/fix
- `test:` - adding or updating tests
- `ci:` - CI/CD changes
- `build:` - build system changes

## Release Workflow

### Creating a Release

```bash
# 1. Create feature branch
git checkout -b feat/my-feature

# 2. Make changes with conventional commits
git commit -m "feat: add new capability"

# 3. Push and create PR to main
git push -u origin feat/my-feature

# 4. After PR merge, Release Please auto-creates Release PR

# 5. Review and merge Release PR when ready to publish
```

### What Release Please Does

When Release PR is merged:

- Updates `package.json` version
- Creates/updates `CHANGELOG.md`
- Creates git tag (e.g., `v0.2.0`)
- Publishes GitHub Release with notes

## Versioning

Follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

Pre-1.0.0 releases may have breaking changes in minor versions.
