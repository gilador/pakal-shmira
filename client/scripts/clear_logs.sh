#!/bin/bash

# Define the directory to search in
DIR="./src"

# Array of directories to exclude
EXCLUDE_DIRS=("test" "cffr")

# Array of files to exclude
EXCLUDE_FILES=("withLogs.tsx" "ApiService.ts" "ShiftScreen/models.ts")

# Find files ending with .ts, .tsx, .js, or .jsx and loop through each file
find "$DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while IFS= read -r FILE
do
    # Check if the file's directory is in the excluded list
    SKIP_FILE=false
    for EXCLUDE_DIR in "${EXCLUDE_DIRS[@]}"
    do
        if [[ "$FILE" == *"/$EXCLUDE_DIR/"* ]]; then
            SKIP_FILE=true
            break
        fi
    done

    # Check if the file is in the excluded files list
    if [[ "${EXCLUDE_FILES[@]}" =~ "$(basename "$FILE")" ]]; then
        SKIP_FILE=true
    fi

    # Skip excluded files
    if [ "$SKIP_FILE" = true ]; then
        continue
    fi

    # Replace console.log commands with a space
    perl -0777 -i -pe 's/console\.log\([^)]*\)//gs' "$FILE"
done

echo "console.log commands replaced with a space."
