#!/usr/bin/env bash

#
# Setup GitHub Branch Protection Ruleset
#
# This script creates a branch protection ruleset for the master/main branch
# using the GitHub CLI (gh).
#
# Prerequisites:
#   - GitHub CLI installed: https://cli.github.com/
#   - Authenticated: `gh auth login`
#   - Repository admin permissions
#
# Usage:
#   ./scripts/setup-branch-protection.sh
#   ./scripts/setup-branch-protection.sh owner/repo
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI (gh) is not installed."
    echo "  Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    log_error "Not authenticated with GitHub CLI."
    echo "  Run: gh auth login"
    exit 1
fi

# Get repository from argument or detect from git remote
if [ $# -ge 1 ]; then
    REPO="$1"
else
    REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null || true)
    if [ -z "$REPO" ]; then
        log_error "Could not detect repository. Please provide it as an argument."
        echo "  Usage: $0 owner/repo"
        exit 1
    fi
fi

log_info "Repository: ${REPO}"

# Check if user has admin access
PERMISSION=$(gh api "/repos/${REPO}" --jq '.permissions.admin' 2>/dev/null || echo "false")
if [ "$PERMISSION" != "true" ]; then
    log_error "You need admin permissions to create rulesets."
    exit 1
fi

log_info "Creating branch protection ruleset..."

# Create the ruleset using the GitHub API
RULESET_RESPONSE=$(gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/${REPO}/rulesets" \
    --input - <<EOF
{
  "name": "protect-master",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": [
        "refs/heads/master",
        "refs/heads/main"
      ],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "required_linear_history"
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": true,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          {
            "context": "Lint"
          },
          {
            "context": "Test"
          },
          {
            "context": "Build"
          }
        ]
      }
    }
  ],
  "bypass_actors": []
}
EOF
) 2>&1

if echo "$RULESET_RESPONSE" | grep -q '"id"'; then
    RULESET_ID=$(echo "$RULESET_RESPONSE" | gh api --input - --jq '.id' 2>/dev/null || echo "")
    log_success "Branch protection ruleset created successfully!"
    log_info "Ruleset ID: ${RULESET_ID}"
else
    # Check if ruleset already exists
    if echo "$RULESET_RESPONSE" | grep -q "already exists"; then
        log_warn "Ruleset 'protect-master' already exists."

        # Offer to update it
        read -p "Do you want to update the existing ruleset? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Get existing ruleset ID
            EXISTING_ID=$(gh api "/repos/${REPO}/rulesets" --jq '.[] | select(.name == "protect-master") | .id' 2>/dev/null || echo "")

            if [ -n "$EXISTING_ID" ]; then
                gh api \
                    --method PUT \
                    -H "Accept: application/vnd.github+json" \
                    -H "X-GitHub-Api-Version: 2022-11-28" \
                    "/repos/${REPO}/rulesets/${EXISTING_ID}" \
                    --input - <<EOF
{
  "name": "protect-master",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": [
        "refs/heads/master",
        "refs/heads/main"
      ],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "required_linear_history"
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": true,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          {
            "context": "Lint"
          },
          {
            "context": "Test"
          },
          {
            "context": "Build"
          }
        ]
      }
    }
  ],
  "bypass_actors": []
}
EOF
                log_success "Ruleset updated successfully!"
            else
                log_error "Could not find existing ruleset ID."
                exit 1
            fi
        fi
    else
        log_error "Failed to create ruleset:"
        echo "$RULESET_RESPONSE"
        exit 1
    fi
fi

echo ""
log_info "Ruleset configuration:"
echo "  • Branch targets: master, main"
echo "  • Prevent deletion: ✓"
echo "  • Prevent force push: ✓"
echo "  • Require linear history: ✓"
echo "  • Require pull request: ✓"
echo "    - Required approvals: 1"
echo "    - Dismiss stale reviews: ✓"
echo "    - Require last push approval: ✓"
echo "    - Require conversation resolution: ✓"
echo "  • Required status checks:"
echo "    - Lint"
echo "    - Test"
echo "    - Build"
echo ""
log_success "Branch protection is now active!"
echo ""
log_info "View ruleset at: https://github.com/${REPO}/settings/rules"
