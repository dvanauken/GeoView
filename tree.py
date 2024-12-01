#!/usr/bin/env python3
from datetime import datetime
import subprocess
import platform
import sys
import re

def main():
    # Get the current timestamp in the format: YYYYMMDDHHmmss
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    # Define the output file name using the timestamp
    output_file = f"tree.{timestamp}.txt"
    
    try:
        # Check if we're on Windows (where 'tree' command differs from Unix)
        if platform.system() == 'Windows':
            # Execute the Tree command on Windows
            result = subprocess.run(['tree', '/A', '/F'], 
                                 capture_output=True, 
                                 text=True, 
                                 check=True)
        else:
            # On Unix-like systems, use 'tree' with similar formatting
            result = subprocess.run(['tree', '-A'], 
                                 capture_output=True, 
                                 text=True, 
                                 check=True)

        # Filter out node_modules and .angular directories
        filtered_lines = [
            line for line in result.stdout.splitlines()
            if not any(excluded in line for excluded in ['node_modules', '.angular'])
        ]
        
        # Write the filtered output to file
        with open(output_file, 'w') as f:
            f.write('\n'.join(filtered_lines))
            
        # Display a message to confirm completion
        print(f"Directory structure saved to {output_file}, excluding 'node_modules' and '.angular' subdirectories.")
        
    except subprocess.CalledProcessError as e:
        print(f"Error executing tree command: {e}", file=sys.stderr)
        sys.exit(1)
    except IOError as e:
        print(f"Error writing to file {output_file}: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()