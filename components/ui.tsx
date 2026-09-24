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
    <div className="rounded-lg border border-slate/15 bg-white p-4 transition-[border-color,box-shadow] duration-150 ease-out hover:border-signal/25 hover:shadow-md">
      <div className="font-mono text-2xl font-bold tabular-nums text-ink">{value}</div>
      <div className="mt-1 text-sm text-slate">{label}</div>
    </div>
  );
}

export function EmptyState({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate/30 bg-white p-6 text-center">
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

export function SelectField({ label, name, options, required = true }: { label: string; name: string; options: string[]; required?: boolean }) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <select name={name} required={required} className="field">
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function TextField({ label, name, type = "text", required = true, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <input className="field" name={name} type={type} required={required} placeholder={placeholder} />
    </label>
  );
}

export function TextAreaField({ label, name, required = true, placeholder }: { label: string; name: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <textarea className="field min-h-28" name={name} required={required} placeholder={placeholder} />
    </label>
  );
}
