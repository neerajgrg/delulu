import type { BuilderState } from '../types/delulu';

/**
 * Returns a quality score from 0 to 5 based on how complete the skill definition is.
 *
 * Scoring rubric:
 *  +1  name is non-empty
 *  +1  description is longer than 20 characters
 *  +1  trigger is non-empty
 *  +1  at least one tag is present
 *  +1  both examples AND constraints have meaningful content (>10 chars each)
 */
export function scoreSkill(state: BuilderState): number {
  let score = 0;

  if (state.name.trim().length > 0) {
    score += 1;
  }

  if (state.description.trim().length > 20) {
    score += 1;
  }

  if (state.trigger.trim().length > 0) {
    score += 1;
  }

  if (state.tags.length > 0) {
    score += 1;
  }

  if (
    state.examples.trim().length > 10 &&
    state.constraints.trim().length > 10
  ) {
    score += 1;
  }

  return score;
}
