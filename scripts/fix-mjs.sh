#!/bin/bash
# This script renames .js files in the ./dist/esm directory to .mjs

for file in ./dist/esm/*.js; do
  echo "Updating $file contents..."
  sed -i '' "s/\.js'/\.mjs'/g" "$file"
  echo "Renaming $file to ${file%.js}.mjs..."
  mv "$file" "${file%.js}.mjs"
done