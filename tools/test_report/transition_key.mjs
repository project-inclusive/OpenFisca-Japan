// Keep guarded alternatives distinct, including automatic transitions and self loops.
export function transitionKey(transition) {
  const node = transition.source;
  const alternatives =
    transition.eventType === ''
      ? node.always
      : node.transitions.get(transition.eventType);
  return `${node.key} / ${
    transition.eventType || 'always'
  } / ${alternatives.indexOf(transition)}`;
}
