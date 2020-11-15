#!/usr/bin/env bash

VERSION="1.0.3"
ICONS_SIZES="16 32 48 64 128"
OUTPUT_FOLDER="_generated_builds"

# Prepare icons
for size in ${ICONS_SIZES}; do
    (
    cd icons || exit 1
    inkscape -w "${size}" -h "${size}" source.svg --export-filename "icon.${size}.png"
    )
done

# Pack to zip
mkdir "${OUTPUT_FOLDER}"
7z a "${OUTPUT_FOLDER}/${VERSION}.zip" -x!pack.sh -x!icons/source.svg -x!"${OUTPUT_FOLDER}"