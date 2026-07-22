# Branch Protection Ruleset

This document describes the recommended GitHub ruleset configuration to protect the `master` branch.

## Setup Instructions

### Via GitHub Web UI

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Rules** → **Rulesets**
3. Click **New ruleset** → **New branch ruleset**
4. Configure as described below

### Ruleset Configuration

#### Basic Settings

| Setting | Value |
|---------|-------|
| **Ruleset name** | `protect-master` |
| **Enforcement status** | `Active` |
| **Bypass list** | Add repository admins if needed for emergency fixes |

#### Target Branches

- **Add target** → **Include by pattern**
- Pattern: `master`

(Also add `main` if you use that as your default branch)

#### Branch Rules

Enable the following rules:

##### ✅ Restrict deletions

Prevents the branch from being deleted.

##### ✅ Require linear history

Prevents merge commits, enforcing squash or rebase merges only.

##### ✅ Require a pull request before merging

| Sub-setting | Value |
|-------------|-------|
| Required approvals | `1` (or more for larger teams) |
| Dismiss stale pull request approvals when new commits are pushed | ✅ Enabled |
| Require review from Code Owners | Optional |
| Require approval of the most recent reviewable push | ✅ Enabled |
| Require conversation resolution before merging | ✅ Enabled |

##### ✅ Require status checks to pass

| Sub-setting | Value |
|-------------|-------|
| Require branches to be up to date before merging | ✅ Enabled |
| **Required status checks** | See below |

Add these required status checks (from `.github/workflows/release.yml`):

- `Lint`
- `Test`
- `Build`

##### ✅ Block force pushes

Prevents force pushes to the protected branch.

##### ❌ Require signed commits (Optional)

Enable if your team uses GPG/SSH signed commits.

##### ❌ Require deployments to succeed (Optional)

Not needed unless you have deployment environments configured.

## Recommended Merge Settings

In **Settings** → **General** → **Pull Requests**:

| Setting | Recommended |
|---------|-------------|
| Allow merge commits | ❌ Disabled |
| Allow squash merging | ✅ Enabled |
| Allow rebase merging | ✅ Enabled |
| Always suggest updating pull request branches | ✅ Enabled |
| Allow auto-merge | ✅ Enabled |
| Automatically delete head branches | ✅ Enabled |

### Default Commit Message

For squash merging, set:
- **Default to pull request title and description**

This ensures the squashed commit follows conventional commit format when PR titles are properly formatted.

## GitHub CLI Setup (Alternative)

You can also create the ruleset using the GitHub CLI:

```bash
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/OWNER/REPO/rulesets \
  -f name='protect-master' \
  -f target='branch' \
  -f enforcement='active' \
  -f 'conditions[ref_name][include][]=refs/heads/master' \
  -f 'conditions[ref_name][include][]=refs/heads/main' \
  -f 'rules[][type]=deletion' \
  -f 'rules[][type]=non_fast_forward' \
  -f 'rules[][type]=pull_request' \
  -f 'rules[1][parameters][required_approving_review_count]=1' \
  -f 'rules[1][parameters][dismiss_stale_reviews_on_push]=true' \
  -f 'rules[1][parameters][require_last_push_approval]=true' \
  -f 'rules[][type]=required_linear_history' \
  -f 'rules[][type]=required_status_checks' \
  -f 'rules[4][parameters][strict_required_status_checks_policy]=true' \
  -f 'rules[4][parameters][required_status_checks][][context]=Lint' \
  -f 'rules[4][parameters][required_status_checks][][context]=Test' \
  -f 'rules[4][parameters][required_status_checks][][context]=Build'
```

> **Note:** Replace `OWNER/REPO` with your repository (e.g., `emmanuel-defreitas/react-native-spline`)

## Commit Message Enforcement

Pull request titles should follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

Examples:
feat: add gyroscope support
fix(android): resolve crash on large assets
docs: update installation instructions
feat!: require Expo SDK 55 (breaking change)
```

The CI workflow validates commit messages on pull requests using `commitlint`.

## Workflow Integration

The branch protection works together with:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Pull requests | Validates code before merge |
| `release.yml` | Push to master/main | Handles versioning and publishing |

### CI Checks on PRs

```
PR opened/updated
    ↓
┌─────────────┐
│    Lint     │──┐
├─────────────┤  │
│    Test     │──┼── All must pass to merge
├─────────────┤  │
│    Build    │──┤
├─────────────┤  │
│ Commitlint  │──┘
└─────────────┘
```

### Release Flow on Master

```
PR merged to master
    ↓
┌─────────────┐
│    Lint     │
├─────────────┤
│    Test     │
├─────────────┤
│    Build    │
└─────────────┘
    ↓ (all pass)
┌─────────────────────┐
│  Semantic Release   │
│  • Analyze commits  │
│  • Bump version     │
│  • Update CHANGELOG │
│  • Create release   │
│  • Publish to npm   │
└─────────────────────┘
```

## Troubleshooting

### Status checks not appearing

If the required status checks don't appear in the dropdown:
1. Ensure the workflow has run at least once on a PR
2. Check that job names in the workflow match exactly: `Lint`, `Test`, `Build`

### Bypassing protection (emergencies only)

Repository admins can be added to the bypass list for emergency situations. Use sparingly and document any bypassed merges.

### Force push needed

If you absolutely need to force push (e.g., to remove sensitive data):
1. Temporarily disable the ruleset
2. Perform the operation
3. Re-enable the ruleset immediately
4. Document the incident

## Security Considerations

- Keep the bypass list minimal
- Require at least 1 approval for all changes
- Enable "Dismiss stale reviews" to prevent approval of outdated code
- Consider requiring CODEOWNERS review for critical paths
