# backend/step_parser.py
from typing import List, Dict
import re

def parse_step(text: str) -> Dict:
    """
    Heuristic parser: convert agent textual output into a single visual step.
    Improve this with LLM-based parsing or rule engine for production.
    """
    if not text:
        return {"visualType": "generic_text", "data": {"text": ""}}

    txt = text.strip()

    low = txt.lower()
    # triangle hints
    if "triangle" in low and ("angle" in low or "angles" in low or "180" in low):
        # if explicit 180 mention -> show_result after highlight
        if "180" in low or "180°" in low:
            return {"visualType": "show_result", "data": {"text": "180°"}}
        return {"visualType": "triangle_build", "data": {}}

    # numbers / equals patterns -> show_result
    m = re.search(r"(equals|=|is)\s+([0-9]+)", low)
    if m:
        return {"visualType": "show_result", "data": {"text": f"{m.group(2)}"}}

    # fallback: generic text step
    return {"visualType": "generic_text", "data": {"text": txt}}
