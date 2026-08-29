import Link from "next/link";

export default function TopicNotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Topic not found</h2>
      <p className="text-gray-600 dark:text-gray-300">The requested topic data does not exist.</p>
      <Link href="/" className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        Back to topics
      </Link>
    </div>
  );
}
