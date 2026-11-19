/**
 * Single choice among a few options, shown as a segmented control (radio
 * buttons: keyboard and screen readers work as for any radio group).
 */
import { useId } from "react";

/** One option. */
export interface ChoiceOption<V extends string> {
  value: V;
  label: string;
}

/** Props of ChoiceGroup. */
export interface ChoiceGroupProps<V extends string> {
  /** Visible title of the group (legend). */
  legend: string;
  /** Options, in order. */
  options: ChoiceOption<V>[];
  /** Selected value. */
  value: V;
  /** Called with the new value. */
  onChange: (value: V) => void;
  /** Disables every option (e.g. while saving). */
  disabled?: boolean;
}

/** Renders a fieldset of radio buttons styled as segments. */
export function ChoiceGroup<V extends string>({ legend, options, value, onChange, disabled }: ChoiceGroupProps<V>) {
  const name = useId();
  return (
    <fieldset className="rk-choice" disabled={disabled}>
      <legend>{legend}</legend>
      <div className="rk-choice-options">
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
