# Very small example parser mapping agent text -> visual steps.
# Replace with a robust NLP-based parser that maps agent reasoning steps into visual actions.

def parse_agent_text(text: str):
    text = (text or "").lower()
    steps = []
    if "triangle" in text or "angles" in text:
        steps.append({
            "visualType": "triangle_build",
            "data": {"base": 4, "height": 3}
        })
        steps.append({
            "visualType": "highlight_angles",
            "data": {"angles": [60, 60, 60]}
        })
        steps.append({
            "visualType": "show_result",
            "data": {"text": "180 degrees"}
        })
    else:
        # fallback generic step
        steps.append({"visualType": "show_result", "data": {"text": text}})
    return steps