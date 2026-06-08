import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-transparent focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            error
              ? "border-red-300 dark:border-red-700 focus:ring-red-500"
              : "border-zinc-200 dark:border-zinc-800 focus:ring-violet-500"
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500 mt-1" role="alert">{error}</p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-zinc-400 mt-1">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-transparent focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none ${
            error
              ? "border-red-300 dark:border-red-700 focus:ring-red-500"
              : "border-zinc-200 dark:border-zinc-800 focus:ring-violet-500"
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500 mt-1" role="alert">{error}</p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-zinc-400 mt-1">{hint}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
