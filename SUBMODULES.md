# Git Submodules Guide

This repository uses Git submodules to include the OCN agent repositories (Orca, Orion, and Weave) at specific versions. This ensures reproducible builds and consistent demo behavior.

## Submodule Structure

```
agents/
├── orca/     → ahsanazmi1/orca (phase-2-explainability)
├── orion/    → ahsanazmi1/orion (phase-2-explainability)
└── weave/    → ahsanazmi1/weave (phase-2-explainability)
```

## Quick Commands

### Initialize Submodules
```bash
# Initialize and fetch all submodules
make submodules
# or manually:
git submodule update --init --recursive
git submodule foreach 'git fetch --tags'
```

### Pin to Specific Versions
```bash
# Pin all submodules to phase-2-explainability (includes Dockerfiles)
make pin
# or manually:
cd agents/orca && git checkout phase-2-explainability && cd ../..
cd agents/orion && git checkout phase-2-explainability && cd ../..
cd agents/weave && git checkout phase-2-explainability && cd ../..
```

> **Note**: Currently using `phase-2-explainability` branches to include Dockerfiles for Docker Compose builds. These will be integrated into `v0.2.0` tags in future releases.

### Update Submodules
```bash
# Update to latest commits on current branches
git submodule update --remote --recursive

# Update to specific tags across all submodules
git submodule foreach 'git fetch --tags && git checkout v0.2.0'
```

## Working with Submodules

### Checking Submodule Status
```bash
# See submodule status
git submodule status

# See which commit each submodule is on
git submodule foreach 'git log --oneline -1'
```

### Making Changes to Submodules
```bash
# Enter a submodule
cd agents/orca

# Make changes, commit, and push
git add .
git commit -m "Your changes"
git push origin phase-2-explainability

# Return to main repo and update submodule reference
cd ../..
git add agents/orca
git commit -m "Update orca submodule"
```

### Troubleshooting

#### Submodule is in detached HEAD state
```bash
# This is normal - submodules are pinned to specific commits
# To update to a new version:
cd agents/orca
git checkout v0.2.0  # or any other tag/branch
cd ../..
git add agents/orca
git commit -m "Update orca to v0.2.0"
```

#### Submodule is missing files
```bash
# Re-initialize the submodule
git submodule deinit -f agents/orca
git submodule update --init --recursive agents/orca
```

#### Clean submodule state
```bash
# Reset all submodules to their configured state
git submodule foreach 'git reset --hard HEAD'
git submodule foreach 'git clean -fd'
```

## Version Management

The demo is designed to work with specific versions of each agent:

- **Orca phase-2-explainability**: Checkout decisions and AI explanations (includes Dockerfile fixes)
- **Orion phase-2-explainability**: Payout optimization and explanations (includes Dockerfile)
- **Weave phase-2-explainability**: CloudEvents subscriber and receipt logging (includes Dockerfile)

### Updating Versions

To update to newer versions:

1. **Check available tags**:
   ```bash
   cd agents/orca
   git tag -l | grep "^v0\."
   ```

2. **Update to new version**:
   ```bash
   git checkout v0.3.0  # or desired version
   cd ../..
   git add agents/orca
   git commit -m "Update orca to v0.3.0"
   ```

3. **Test the demo**:
   ```bash
   make up
   make smoke
   ```

## Best Practices

1. **Always pin to specific tags** for reproducible demos
2. **Test after updating** submodule versions
3. **Commit submodule updates** in the main repository
4. **Use the Makefile commands** when possible for consistency

## Integration with CI/CD

The GitHub Actions workflow automatically:
- Initializes submodules with `submodules: true`
- Pins to phase-2-explainability branches (includes Dockerfiles)
- Builds and tests the complete demo

This ensures that CI runs are consistent with local development.
