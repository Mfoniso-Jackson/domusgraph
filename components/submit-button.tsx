"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "Submitting…",
  variant = "primary",
  className = ""
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${variant === "primary" ? "button-primary" : "button-secondary"} ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
