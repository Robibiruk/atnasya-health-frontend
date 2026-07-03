// Spinner — gentle loading indicator in brand plum.
export function Spinner() {
  return (
    <div className="flex items-center justify-center p-6" role="status">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"
        aria-label="Loading"
      />
    </div>
  );
}
