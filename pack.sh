#!/usr/bin/env bash

VERSION="1.3.0-chrome"
ICONS_SIZES="16 32 48 64 128"
OUTPUT_FOLDER=".build"

# Prepare icons
for size in ${ICONS_SIZES}; do
  (
    cd public/icons || exit 1
    inkscape -w "${size}" -h "${size}" source.svg --export-filename "icon.${size}.png"
  )
done

# Pack to zip
mkdir -p "${OUTPUT_FOLDER}"
(cd dist && zip -r "${VERSION}.zip" ./*)
mv dist/"${VERSION}.zip" "${OUTPUT_FOLDER}"
