export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");

  const days = Math.floor(hours / 24);
  if (days < 30) return rtf.format(-days, "day");

  const months = Math.floor(days / 30);
  if (months < 12) return rtf.format(-months, "month");

  const years = Math.floor(months / 12);
  return rtf.format(-years, "year");
}

export function formatDuration(ms: number): string {
  const nf = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
  if (ms >= 1000) {
    return `${nf.format(ms / 1000)}s`;
  }
  const intFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
  return `${intFormatter.format(ms)}ms`;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
