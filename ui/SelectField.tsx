/**
 * Drop-down list with label and error messages, in the style of FormField.
 */
import { useId, type ReactNode } from "react";

import { HelpTip } from "./HelpTip";

/** Props of SelectField. */
export interface SelectFieldProps {
  /** Visible label. */
  label: string;
  /** Explanation of the field, in a HelpTip next to the label (0.17.0). */
  help?: ReactNode;
  /** Selected value ("" = none). */
  value: string;
  /** Called with the new value. */
  onChange: (value: string) => void;
  /** The <option> elements; an empty first option (`emptyLabel`) is added unless emptyLabel is null. */
  children: ReactNode;
  /** Error messages of the field; empty = none. */
  errors?: string[];
  disabled?: boolean;
  /** Text of the empty first option, e.g. "All" for a filter; default "—"; null = no empty option (a choice is required). */
  emptyLabel?: string | null;
}

/** Renders label + select + errors (aria-invalid / aria-describedby when there are errors). */
export function SelectField({ label, value, onChange, children, errors = [], disabled, emptyLabel = "—", help }: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-errors`;
  const invalid = errors.length > 0;
  return (
    <div className="rk-field">
      {help === undefined ? (
        <label htmlFor={id}>{label}</label>
      ) : (
        <span className="rk-field-label-help">
          <label htmlFor={id}>{label}</label>
          <HelpTip topic={label}>{help}</HelpTip>
        </span>
      )}
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        {emptyLabel !== null && <option value="">{emptyLabel}</option>}
        {children}
      </select>
      {invalid && (
        <ul id={errorId} className="rk-field-errors">
          {errors.map((message) => <li key={message}>{message}</li>)}
        </ul>
      )}
    </div>
  );
}
