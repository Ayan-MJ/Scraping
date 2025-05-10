#!/usr/bin/env python3
"""
Script to fix unused imports in Python files using autopep8.
Run from the project root directory.

Prerequisites:
    pip install autopep8
"""

import os
import subprocess
import sys

def fix_file(filepath):
    """Fix unused imports in a file using autopep8."""
    print(f"Processing {filepath}")
    try:
        subprocess.run(
            ["autopep8", "--select=F401", "--in-place", filepath],
            check=True
        )
        print(f"  Fixed imports in {filepath}")
    except subprocess.CalledProcessError as e:
        print(f"Error fixing imports in {filepath}: {e}")

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
    print("Import fixes completed. Remaining issues may require manual fixes.") 