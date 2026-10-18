#!/bin/bash

# Deploy new versions on git push to server
# Match tags: api-v* only

set -euo pipefail

while read -r oldrev newrev ref; do
  case $ref in refs/tags/api-v*)
    TAG="${ref#refs/tags/}"
    ;;
  *)
    continue
    ;;
  esac

  [ "$newrev" == "0000000000000000000000000000000000000000" ] && continue
  git checkout -f "$TAG";
  nix develop -c bash -euo pipefail -c '
    pnpm install
    pnpm --filter api build
    systemctl restart api.service
  '
done
