import os
import re

# Simple script to find emojis in ts/tsx files
emoji_pattern = re.compile(
    "["
    "\u2600-\u27bf"          # miscellaneous symbols / dingbats
    "\U0001f300-\U0001f5ff"  # symbols & pictographs
    "\U0001f600-\U0001f64f"  # emoticons
    "\U0001f680-\U0001f6ff"  # transport & map symbols
    "\U0001f900-\U0001f9ff"  # supplemental symbols
    "]",
    re.UNICODE
)

exclude_dirs = {'.git', 'node_modules', '.expo', 'scratch', '.claude'}

for root, dirs, files in os.walk('/Users/gio/Desktop/watchmatch'):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    for line_num, line in enumerate(f, 1):
                        matches = emoji_pattern.findall(line)
                        if matches:
                            print(f"{filepath}:{line_num} -> {','.join(matches)}: {line.strip()}")
            except Exception as e:
                pass
