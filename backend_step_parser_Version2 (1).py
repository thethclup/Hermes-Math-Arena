# backend/step_parser.py
# Map agent textual output -> structured visual steps.
# This is a heuristic starter; replace with stronger NLP/LLM parsing for production.

from typing import List, Dict

def parse_agent_text(text: str) -> List[Dict]:
    text = (text or "").lower()
    steps = []
    # simple heuristics
    if "triangle" in text and ("angle" in text or "angles" in text or "180" in text):
        steps.append({"visualType": "triangle_build", "data": {"base": 4, "height": 3}})
        steps.append({"visualType": "highlight_angles", "data": {"angles": [60, 60, 60]}})
        steps.append({"visualType": "show_result", "data": {"text": "180 degrees"}})
        return steps

    # detect numeric result pattern: "equals 42" -> show_result
    import re
    m = re.search(r"(equals|=|is)\s+([0-9]+)", text)
    if m:
        steps.append({"visualType": "show_result", "data": {"text": f\"{m.group(2)}\"}})
        return steps

    # fallback: return the text as a single show_result step
    steps.append({"visualType": "show_result", "data": {"text": text}})
    return steps