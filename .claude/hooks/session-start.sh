#!/bin/bash
# Set this repo's git identity and enable its hooks, every session.
#
# A cloud session gets a fresh container whose git config is whatever the
# image ships — which is how two commits in this repo came to be authored by
# the assistant rather than by its owner, one step after the rule against it
# was written down. Machine config is not repo state, so the repo has to
# assert it on the way in rather than trust what it finds.
#
# Idempotent, instant, and correct on a local machine too, so it is not
# gated on CLAUDE_CODE_REMOTE.
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

git config user.name  "Louis Dyrhauge"
git config user.email "94385943+louvalman@users.noreply.github.com"

# Versioned hooks live in .githooks/ because .git/hooks is not tracked and so
# never survives a clone.
git config core.hooksPath .githooks

echo "git identity: $(git config user.name) <$(git config user.email)>"
echo "hooks path:   $(git config core.hooksPath)"
