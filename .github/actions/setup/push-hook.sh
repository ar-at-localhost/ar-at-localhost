#!/bin/sh
set -e
. /etc/nix/push-hook.env
export PATH=/nix/var/nix/profiles/default/bin:$PATH
export ATTIC_BUCKET ATTIC_BUCKET_REGION AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY

nix copy \
  --to "s3://$ATTIC_BUCKET?endpoint=storage.googleapis.com&scheme=https&region=$ATTIC_BUCKET_REGION&compression=zstd&secret-key=/etc/nix/signing-key" \
  $OUT_PATHS || echo "Cache push failed for: $OUT_PATHS" >&2

exit 0
