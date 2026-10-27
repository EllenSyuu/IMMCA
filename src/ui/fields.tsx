import { useId, type ReactNode } from 'react';

export function NumberField(props: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; help?: string; suffix?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{props.label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={Number.isFinite(props.value) ? props.value : ''}
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        aria-describedby={props.help ? `${id}-help` : undefined}
        onChange={(e) => props.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
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

export function SelectField<T extends string | number>(props: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  const id = useId();
  return (
    <div className="field">
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

export function Toggle(props: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} />
      <span>{props.label}</span>
    </label>
  );
}

export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="step">
      <legend><span className="step__n" aria-hidden="true">{n}</span>{title}</legend>
      <div className="step__body">{children}</div>
    </fieldset>
  );
}
