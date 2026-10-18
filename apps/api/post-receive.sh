#!/bin/bash

# Deploy new versions on git push to server
# Match tags: api-v* only

set -euo pipefail
src=$(git rev-parse --show-toplevel)
cd "$src"

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
    cp -f apps/api/api.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable api.service
    systemctl restart api.service
  '
done
