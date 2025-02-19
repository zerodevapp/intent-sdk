#!/bin/bash

restore_type_field() {
    local package_file="package.json"
    local type_file="$package_file.type"
    
    if [ -f "$type_file" ]; then
        TYPE=$(cat "$type_file")
        echo "📦 Restoring type field to $package_file"
        # Restore type field in its original position by converting to entries again
        jq --arg type "$TYPE" 'to_entries | map(select(.key != "type")) | . + [{"key": "type", "value": $type}] | from_entries' "$package_file" > "$package_file.tmp" && mv "$package_file.tmp" "$package_file"
        rm "$type_file"
    fi
}

restore_type_field