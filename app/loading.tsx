export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center" role="status" aria-label="Loading topic">
      <div className="size-10 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
      <span className="sr-only">Loading topic...</span>
    </div>
  );
}
