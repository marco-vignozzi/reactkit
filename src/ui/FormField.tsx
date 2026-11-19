/**
 * Text input with label and error messages.
 */

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { HelpTip } from "./HelpTip.tsx";

/** Props of FormField: those of <input>, plus label and errors. */
export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Visible label. */
  label: string;
  /** Explanation of the field, in a HelpTip next to the label (0.17.0). */
  help?: ReactNode;
  /** Error messages of the field (e.g. ApiError.errors[name]); empty = none. */
  errors?: string[];
}

/**
 * Renders label + input + errors. The input gets aria-invalid and
 * aria-describedby pointing to the errors when there are any.
 */
export function FormField({ label, errors = [], help, className, ...input }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-errors`;
  const invalid = errors.length > 0;
  return (
    <div className={["rk-field", className].filter(Boolean).join(" ")}>
      {help === undefined ? (
        <label htmlFor={id}>{label}</label>
      ) : (
        <span className="rk-field-label-help">
          <label htmlFor={id}>{label}</label>
          <HelpTip topic={label}>{help}</HelpTip>
        </span>
      )}
      <input id={id} aria-invalid={invalid || undefined} aria-describedby={invalid ? errorId : undefined} {...input} />
      {invalid && (
        <ul id={errorId} className="rk-field-errors">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
