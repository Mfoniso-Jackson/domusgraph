import Link from "next/link";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</div>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate/12 ${className}`} />;
}

export function SectionHeader({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="mb-6 max-w-3xl">
      {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase text-signal">{eyebrow}</p> : null}
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
      {body ? <p className="mt-3 text-base leading-7 text-slate">{body}</p> : null}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate/15 bg-surface p-4 transition-[border-color,box-shadow] duration-150 ease-out hover:border-signal/25 hover:shadow-md">
      <div className="font-mono text-2xl font-bold tabular-nums text-ink">{value}</div>
      <div className="mt-1 text-sm text-slate">{label}</div>
    </div>
  );
}

export function EmptyState({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate/30 bg-surface p-6 text-center">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate">{body}</p>
      {href && action ? (
        <Link href={href} className="button-primary mt-4">
          {action}
        </Link>
      ) : null}
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <span className="label">
      {label}
      {!required ? <span className="ml-1 font-normal text-slate">(optional)</span> : null}
    </span>
  );
}

type SelectFieldProps = { label: string; name: string; options: string[]; required?: boolean } & Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "name" | "required" | "className"
>;

export function SelectField({ label, name, options, required = true, ...rest }: SelectFieldProps) {
  return (
    <label className="grid gap-2">
      <FieldLabel label={label} required={required} />
      <select name={name} required={required} className="field" {...rest}>
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

type TextFieldProps = { label: string; name: string; type?: string; required?: boolean; placeholder?: string; hint?: string } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "required" | "placeholder" | "className"
>;

export function TextField({ label, name, type = "text", required = true, placeholder, hint, ...rest }: TextFieldProps) {
  return (
    <label className="grid gap-2">
      <FieldLabel label={label} required={required} />
      <input className="field" name={name} type={type} required={required} placeholder={placeholder} {...rest} />
      {hint ? <span className="text-xs text-slate">{hint}</span> : null}
    </label>
  );
}

type TextAreaFieldProps = { label: string; name: string; required?: boolean; placeholder?: string; hint?: string } & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name" | "required" | "placeholder" | "className"
>;

export function TextAreaField({ label, name, required = true, placeholder, hint, ...rest }: TextAreaFieldProps) {
  return (
    <label className="grid gap-2">
      <FieldLabel label={label} required={required} />
      <textarea className="field min-h-28" name={name} required={required} placeholder={placeholder} {...rest} />
      {hint ? <span className="text-xs text-slate">{hint}</span> : null}
    </label>
  );
}
