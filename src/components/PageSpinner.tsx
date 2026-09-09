export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-[3px] border-border border-t-blue-dark animate-spin" />
    </div>
  );
}
