#!/usr/bin/env python3
import sys
import subprocess

def usage():
    print("Usage: tag-version.py <tag_name> <tag_message>")
    print('Example: tag-version.py v1.0.0 "Initial release"')
    sys.exit(1)

def main():
    # Check if help is requested or if arguments are missing
    if len(sys.argv) < 3 or sys.argv[1] == "?":
        usage()

    tag_name = sys.argv[1]
    tag_message = sys.argv[2]

    # Display confirmation
    print(f"Tag Name: {tag_name}")
    print(f"Tag Message: {tag_message}")
    confirm = input("Do you want to proceed? (YES/NO): ")

    if confirm.upper() != "YES":
        print("Operation cancelled.")
        sys.exit(1)

    # Create and push the tag
    try:
        subprocess.run(['git', 'tag', '-a', tag_name, '-m', tag_message], 
                      check=True, 
                      stderr=subprocess.PIPE,
                      text=True)
    except subprocess.CalledProcessError as e:
        print("Failed to create tag.")
        print(e.stderr)
        sys.exit(1)

    try:
        subprocess.run(['git', 'push', 'origin', tag_name],
                      check=True,
                      stderr=subprocess.PIPE,
                      text=True)
    except subprocess.CalledProcessError as e:
        print("Failed to push tag.")
        print(e.stderr)
        sys.exit(1)

    print(f"Tag {tag_name} has been successfully created and pushed.")
    sys.exit(0)

if __name__ == "__main__":
    main()