#!/bin/bash

# Truncate the existing "icons.txt" file
> icons.txt

# Loop through all files in the current directory
for file in *
do
    # Check if the item is a regular file
    if [ -f "$file" ]
    then
        # Append the filename to "icons.txt" with the desired format
        echo "<file>icon-sets/carbon/icons/$file</file>" >> icons.txt
    fi
done
