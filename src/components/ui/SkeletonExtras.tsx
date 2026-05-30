/**
 * Custom skeleton variant components — do not import from skeleton.tsx to avoid casing conflict.
 */

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-pulse">
      <div className="h-4 w-full bg-muted rounded-md" />
      <div className="h-3 w-3/5 bg-muted rounded-md" />
      <div className="h-3 w-2/5 bg-muted rounded-md" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
        <div key={i} className="flex gap-4">
          <div className="h-10 w-[30%] bg-muted rounded-md" />
          <div className="h-10 w-[20%] bg-muted rounded-md" />
          <div className="h-10 w-[25%] bg-muted rounded-md" />
          <div className="h-10 w-[15%] bg-muted rounded-md" />
        </div>
      ))}
    </div>
  );
}
