#!/usr/bin/env python3
"""
Script to split the monolithic CSS file into modular architecture
"""

import os
import re

# Base paths
BASE_DIR = "/Users/brandonhinrichs/Local Repositories/Websites/Aspire Impact Network Website"
CSS_FILE = os.path.join(BASE_DIR, "css/styles.css")
OUTPUT_BASE = os.path.join(BASE_DIR, "src/styles")

# Read the entire CSS file
with open(CSS_FILE, 'r') as f:
    css_content = f.read()

# Split into sections based on comments and content
sections = {
    'variables': {'start': ':root {', 'end': '^}$', 'file': 'base/_variables.css'},
    'reset': {'start': '/* Reset and Base Styles */', 'end': 'box-sizing: border-box;', 'file': 'base/_reset.css'},
}

def extract_section(content, start_marker, end_marker=None, multi_section=False):
    """Extract a section from CSS content"""
    lines = content.split('\n')
    result = []
    capturing = False
    brace_count = 0

    for i, line in enumerate(lines):
        if not capturing and start_marker in line:
            capturing = True
            result.append(line)
            if '{' in line:
                brace_count += line.count('{') - line.count('}')
            continue

        if capturing:
            result.append(line)
            brace_count += line.count('{') - line.count('}')

            if brace_count == 0 and '{' in ''.join(result):
                if not multi_section:
                    break
                capturing = False

    return '\n'.join(result)

def write_file(filepath, content, header_comment):
    """Write content to file with header comment"""
    full_path = os.path.join(OUTPUT_BASE, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    with open(full_path, 'w') as f:
        f.write(f"/* {header_comment} */\n\n")
        f.write(content)

    print(f"Created: {filepath}")

# Extract :root variables
print("Extracting variables...")
variables = extract_section(css_content, ':root {')
write_file('base/_variables.css', variables, 'CSS Custom Properties (Variables)')

# Extract reset styles
print("Extracting reset styles...")
reset_content = """* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}"""
write_file('base/_reset.css', reset_content, 'CSS Reset and Base Styles')

# Extract typography (body and text-related styles)
print("Extracting typography...")
typography_start = css_content.find('body {')
typography_end = css_content.find('/* Animated background */')
typography = css_content[typography_start:typography_end].strip()
write_file('base/_typography.css', typography, 'Typography and Base Text Styles')

print("\nExtraction complete! Now processing remaining sections...")
