#!/usr/bin/env bash
# Rebuild dist/ux-qa.plugin from plugins/ux-qa/ after editing the source.
# Then reinstall it via the desktop app's Plugins dialog.
set -e
cd "$(dirname "$0")"
cp README.md plugins/ux-qa/README.md
rm -f dist/ux-qa.plugin
mkdir -p dist
(cd plugins/ux-qa && zip -rq ../../dist/ux-qa.plugin . -x "*.DS_Store")
echo "built dist/ux-qa.plugin ($(du -h dist/ux-qa.plugin | cut -f1))"
