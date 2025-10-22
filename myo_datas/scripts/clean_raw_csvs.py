from pathlib import Path
import runpy

BASE = Path(__file__).parents[1]
notebooks = [
    BASE / 'notebooks' / 'clean_programs_detailed.ipynb',
    BASE / 'notebooks' / 'clean_program_summary.ipynb',
]

# Instead of executing notebooks, call the modules (notebooks contain Python cells) by executing their code if exported as .py
# Create a small wrapper that will import and run the notebooks as scripts if .py equivalents exist.

scripts = [
    BASE / 'notebooks' / 'clean_programs_detailed.ipynb',
    BASE / 'notebooks' / 'clean_program_summary.ipynb'
]

print('Please run the notebooks manually or convert them to .py to execute.')
