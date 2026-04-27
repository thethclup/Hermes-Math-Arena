// Map reasoning steps into calls that AnimationDirector/SceneManager can consume.
// This is intentionally small — expand mappings per visualType as needed.

export function mapStepToVisual(step) {
  if (!step || !step.visualType) return null;

  const vt = step.visualType;
  const data = step.data || {};

  switch (vt) {
    case 'triangle_build':
      return {
        type: 'spawnTriangle',
        payload: { base: data.base || 4, height: data.height || 3 }
      };

    case 'highlight_angles':
      return {
        type: 'highlightAngles',
        payload: { angles: data.angles || [60,60,60] }
      };

    case 'show_result':
      return {
        type: 'showResult',
        payload: { text: data.text || '' }
      };

    // add more mappings: calculus, vectors, matrices, proofs, etc.
    default:
      return { type: 'rawStep', payload: { step } };
  }
}

// Helper to dispatch mapped visual to a global AnimationDirector (or return for callers)
export function dispatchStep(step) {
  const mapped = mapStepToVisual(step);
  if (!mapped) return;
  if (window.animationDirector && typeof window.animationDirector.playStep === 'function') {
    window.animationDirector.playStep(mapped);
    return;
  }
  // fallback: emit an event
  window.dispatchEvent(new CustomEvent('hermes:visualStep', { detail: mapped }));
}
