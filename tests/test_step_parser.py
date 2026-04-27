from backend.step_parser import parse_agent_text

def test_triangle_parse():
    text = "The triangle interior angles sum to 180 degrees."
    steps = parse_agent_text(text)
    # expect at least a triangle_build and show_result
    types = [s['visualType'] for s in steps]
    assert 'triangle_build' in types
    assert 'highlight_angles' in types
    assert any(s['visualType']=='show_result' for s in steps)
