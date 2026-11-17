/**
 * Helpers of forms.
 *
 * Multi-step forms check the required fields of the current step before
 * "Next" (rule of the project, 2026-11-18): the button stays disabled while
 * one is blank, so a missing value is never discovered only at the end.
 * The server still validates everything.
 *
 * Functions:
 *   - missingFields(values, names) -> the names whose value is blank
 */

/**
 * The required fields still blank (empty or only spaces).
 *
 * @param values - the typed values of the form, by field name.
 * @param names - the required field names to check.
 * @returns The blank ones, in the order of `names`.
 */
export function missingFields<K extends string>(values: Record<K, string>, names: readonly K[]): K[] {
  return names.filter((name) => values[name].trim() === "");
}
