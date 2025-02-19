#!/bin/bash


remove_type_field() {
    local package_file="package.json"
    
    if TYPE=$(jq -r '.type // empty' "$package_file"); then
        echo "📦 Removing type field from $package_file"
        # Convert to array of key-value pairs, filter out type, convert back while preserving order
        jq 'to_entries | map(select(.key != "type")) | from_entries' "$package_file" > "$package_file.tmp" && mv "$package_file.tmp" "$package_file"
        echo "$TYPE" > "$package_file.type"
    fi
}

remove_type_field