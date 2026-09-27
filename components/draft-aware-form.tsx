"use client";

import { useRouter } from "next/navigation";

export function DraftAwareForm({
  action,
  isSignedIn,
  className,
  children
}: {
  action: (formData: FormData) => void | Promise<void>;
  isSignedIn: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (isSignedIn) return;
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("$ACTION")) continue;
      if (typeof value === "string" && value) params.set(key, value);
    }
    const next = `${window.location.pathname}?${params.toString()}`;
    router.push(`/auth/sign-in?next=${encodeURIComponent(next)}`);
  }

  return (
    <form action={action} onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
