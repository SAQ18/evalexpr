#!/bin/bash
# This script renames .js files in the ./dist/esm directory and its subfolders to .mjs

# Find all .js files in ./dist/esm and its subdirectories
find ./dist/esm -name "*.js" -type f | while read -r file; do
  echo "Updating $file contents..."
  sed -i '' "s/\.js'/\.mjs'/g" "$file"
  echo "Renaming $file to ${file%.js}.mjs..."
  mv "$file" "${file%.js}.mjs"
done
