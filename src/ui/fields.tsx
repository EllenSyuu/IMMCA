import { useId, type ReactNode } from 'react';
import { Check, ChevronDown, Minus, Plus } from 'lucide-react';

/** A number with − / + buttons, so the common case needs no typing. */
export function NumberField(props: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; help?: string; suffix?: string;
}) {
  const id = useId();
  const step = props.step ?? 1;
  const clamp = (v: number) => Math.min(props.max ?? Infinity, Math.max(props.min ?? -Infinity, v));
  const nudge = (d: number) => props.onChange(clamp(Math.round(((Number.isFinite(props.value) ? props.value : 0) + d) * 100) / 100));
  return (
    <div className="field">
      <label htmlFor={id}>{props.label}</label>
      <div className="stepper">
        <button type="button" tabIndex={-1} aria-hidden="true" disabled={props.min !== undefined && props.value <= props.min} onClick={() => nudge(-step)}><Minus size={16} /></button>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(props.value) ? props.value : ''}
          min={props.min}
          max={props.max}
          step={step}
          aria-describedby={props.help ? `${id}-help` : undefined}
          onChange={(e) => props.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
        <button type="button" tabIndex={-1} aria-hidden="true" disabled={props.max !== undefined && props.value >= props.max} onClick={() => nudge(step)}><Plus size={16} /></button>
      </div>
      {props.help && <small id={`${id}-help`}>{props.help}</small>}
    </div>
  );
}

export function TextField(props: { label: string; value: string; onChange: (v: string) => void; help?: string; placeholder?: string; pattern?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{props.label}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={props.value}
        placeholder={props.placeholder}
        pattern={props.pattern}
        aria-describedby={props.help ? `${id}-help` : undefined}
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.help && <small id={`${id}-help`}>{props.help}</small>}
    </div>
  );
}

/**
 * A single choice. Short lists render as tappable chips (one tap, all options
 * visible); long ones, such as the provinces, as a menu.
 */
export function SelectField<T extends string | number>(props: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; wide?: boolean; variant?: 'auto' | 'chips' | 'menu';
}) {
  const id = useId();
  const chars = props.options.reduce((a, o) => a + o.label.length, 0);
  const chips = props.variant === 'chips' || (props.variant !== 'menu' && props.options.length <= 7 && chars <= 150);
  if (chips) {
    return (
      <div className="field span-2" role="radiogroup" aria-labelledby={id}>
        <span className="field__label" id={id}>{props.label}</span>
        <div className="choices">
          {props.options.map((o) => (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={o.value === props.value}
              className="choice"
              onClick={() => props.onChange(o.value)}
            >
              {o.value === props.value && <Check size={15} strokeWidth={2.6} aria-hidden="true" />}
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={props.wide ? 'field span-2' : 'field'}>
      <label htmlFor={id}>{props.label}</label>
      <select
        id={id}
        value={String(props.value)}
        onChange={(e) => {
          const raw = e.target.value;
          const match = props.options.find((o) => String(o.value) === raw);
          if (match) props.onChange(match.value);
        }}
      >
        {props.options.map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
    </div>
  );
}

/** An on/off question, shown as a switch. */
export function Toggle(props: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" role="switch" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} />
      <span className="toggle__track" aria-hidden="true"><span /></span>
      <span>{props.label}</span>
    </label>
  );
}

/** A collapsible form step: closed, it shows a one-line summary of what was entered. */
export function Step({ n, title, summary, defaultOpen = false, children }: {
  n: number; title: string; summary: string; defaultOpen?: boolean; children: ReactNode;
}) {
  return (
    <details className="step" open={defaultOpen}>
      <summary>
        <span className="step__n" aria-hidden="true">{n}</span>
        <span className="step__title">{title}</span>
        <span className="step__summary">{summary}</span>
        <ChevronDown className="step__chevron" size={18} aria-hidden="true" />
      </summary>
      <div className="step__body">{children}</div>
    </details>
  );
}
