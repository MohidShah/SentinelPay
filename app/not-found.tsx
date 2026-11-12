import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-3xl font-bold tracking-tight text-white">404 - Page Not Found</h2>
      <p className="mt-2 text-sm text-muted">The requested resource could not be found.</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-9 items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400"
      >
        Return to Shopping Assistant
      </Link>
    </div>
  );
}

