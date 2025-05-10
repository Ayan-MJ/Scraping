#!/usr/bin/env python3
"""
Script to automatically fix common linting issues in Python files.
Run from the project root directory.
"""

import os
import re
import sys
from pathlib import Path

def fix_file(filepath):
    """Fix common linting issues in a file."""
    print(f"Processing {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix trailing whitespace
    fixed_content = re.sub(r'[ \t]+$', '', content, flags=re.MULTILINE)
    
    # Ensure file ends with exactly one newline
    fixed_content = fixed_content.rstrip('\n') + '\n'
    
    # Write back if changes were made
    if content != fixed_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"  Fixed whitespace issues in {filepath}")

def main():
    # Process backend Python files
    for root, _, files in os.walk("backend/app"):
        for file in files:
            if file.endswith(".py"):
                fix_file(os.path.join(root, file))
    
    # Process test files
    for root, _, files in os.walk("backend/tests"):
        for file in files:
            if file.endswith(".py"):
                fix_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
    print("Linting fixes completed. Remaining issues may require manual fixes.") 