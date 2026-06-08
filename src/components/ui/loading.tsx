export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );
}

export function LoadingScreen({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
      <div className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}
