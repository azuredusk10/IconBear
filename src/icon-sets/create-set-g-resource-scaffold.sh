#!/bin/bash

# Truncate the existing "icons.txt" file
> icons.txt

# Change to the "icons" directory
cd icons

# Loop through all files in the "icons" directory
for file in *
do
    # Check if the item is a regular file
    if [ -f "$file" ]
    then
        # Append the filename to "icons.txt" with the desired format
        echo "<file>icon-sets/feather/icons/$file</file>" >> ../icons.txt
    fi
done

# Change back to the original directory
cd ..
