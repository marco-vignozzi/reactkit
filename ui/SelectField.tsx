/**
 * Drop-down list with label and error messages, in the style of FormField.
 */
import { useId, type ReactNode } from "react";

/** Props of SelectField. */
export interface SelectFieldProps {
  /** Visible label. */
  label: string;
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
export function SelectField({ label, value, onChange, children, errors = [], disabled, emptyLabel = "—" }: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-errors`;
  const invalid = errors.length > 0;
  return (
    <div className="rk-field">
      <label htmlFor={id}>{label}</label>
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
