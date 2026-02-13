#!/usr/bin/env sh
# Pre-commit gitleaks check (best-effort):
# - preferred: run gitleaks via docker
# - fallback: simple grep on staged files (not exhaustive)

set -e
ROOT="$(pwd)"
# Try docker gitleaks first
if command -v docker >/dev/null 2>&1; then
  echo "🔒 Running gitleaks (docker)..."
  docker run --rm -v "$ROOT":/repo zricethezav/gitleaks:latest detect -s /repo -c /repo/.gitleaks.toml --exit-code 1 || {
    echo "\ngitleaks detected potential secrets — aborting commit.\nRun 'docker run --rm -v \"$ROOT\":/repo zricethezav/gitleaks:latest detect -s /repo -c /repo/.gitleaks.toml' to inspect." >&2
    exit 1
  }
  echo "gitleaks: OK"
  exit 0
fi

# Fallback: grep staged files for common secret-like patterns (best-effort)
echo "⚠️ Docker not available — running lightweight staged-file scan (fallback)."
STAGED_FILES=$(git diff --cached --name-only --relative)
PATTERN='(apikey|api_key|secret|token|passwd|password|aws_secret|private_key)'
FOUND=0
for f in $STAGED_FILES; do
  # skip binary files
  case "$f" in
    *.png|*.jpg|*.jpeg|*.gif|*.lock|*.min.*) continue ;;
  esac
  if git show :"$f" 2>/dev/null | grep -inE "$PATTERN" >/dev/null 2>&1; then
    echo "Potential secret found in staged file: $f" >&2
    git show :"$f" | grep -nE "$PATTERN" | sed -n '1,5p' >&2
    FOUND=1
  fi
done
if [ "$FOUND" -eq 1 ]; then
  echo "\nFallback scan found likely secrets — aborting commit. Install Docker for full gitleaks check or fix the files above." >&2
  exit 1
fi

echo "Fallback scan: OK"
exit 0
