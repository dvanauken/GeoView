#!/usr/bin/env python3
import os
from datetime import datetime
import sys

# List of folders to exclude
EXCLUDE_FOLDERS = {"node_modules", ".angular", ".git", "dist", ".idea"}
# Common text file extensions to read
TEXT_EXTENSIONS = {".html", ".ts", ".scss"}

def show_tree(path=".", prefix="", output_file=None):
    """Recursively display directory tree structure with file contents for specific extensions."""
    try:
        # Get all items in directory
        items = []
        with os.scandir(path) as it:
            for entry in it:
                # Skip excluded folders
                if entry.is_dir() and entry.name in EXCLUDE_FOLDERS:
                    continue
                items.append(entry)
        
        # Sort items (directories first, then alphabetically)
        items.sort(key=lambda x: (not x.is_dir(), x.name))
        
        # Process each item
        for i, item in enumerate(items):
            is_last = (i == len(items) - 1)
            
            # Determine the prefix for tree branches
            if is_last:
                current_prefix = f"{prefix}\\-- "
                next_prefix = f"{prefix}    "
            else:
                current_prefix = f"{prefix}+-- "
                next_prefix = f"{prefix}|   "
            
            # Create the line with the item name
            line = current_prefix + item.name
            
            # For files with specific extensions, append their content
            if item.is_file():
                ext = os.path.splitext(item.name)[1].lower()
                if ext in TEXT_EXTENSIONS:
                    try:
                        with open(item.path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if content:
                                # Replace newlines and multiple spaces with single spaces
                                content = ' '.join(content.split())
                                line += f": {content}"
                    except Exception:
                        line += ": <error reading file>"
            
            # Write the line to the output file
            with open(output_file, 'a', encoding='utf-8') as f:
                f.write(line + '\n')
            
            # Recursively process directories
            if item.is_dir():
                show_tree(item.path, next_prefix, output_file)
    except Exception as e:
        print(f"Error processing path {path}: {str(e)}", file=sys.stderr)

def main():
    # Get command line argument for path, default to current directory
    path = sys.argv[1] if len(sys.argv) > 1 else "."
    
    # Create output filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    output_file = f"tree.{timestamp}.txt"
    
    try:
        # Create or clear the output file
        with open(output_file, 'w', encoding='utf-8') as f:
            pass
        
        # Generate the tree
        show_tree(path, "", output_file)
        
        print(f"Directory structure saved to {output_file}.")
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()