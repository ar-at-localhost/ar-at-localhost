#!/bin/bash

# Deploy new versions on git push to server
# Match tags: api-v* only

set -euo pipefail
gitdir=$(git rev-parse --show-toplevel)
src=$(dirname "$gitdir")

while read -r oldrev newrev ref; do
  case $ref in refs/tags/api@*)
    TAG="${ref#refs/tags/}"
    ;;
  *)
    continue
    ;;
  esac

  [ "$newrev" == "0000000000000000000000000000000000000000" ] && continue
  git --work-tree "$src" checkout --force --detach "$TAG"
  cd "$src"
  nix develop -c bash -euo pipefail -c '
    pnpm turbo run --filter api build
    cp -f apps/api/api.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable api.service
    systemctl restart api.service
  '
done
