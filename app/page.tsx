import TopicCard from "@/components/TopicCard";

import { getTopics } from "@/lib/api";

export default async function Home() {
  const topics = await getTopics();

  return (
    <>
      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics?.map((topic) => (
          <TopicCard key={topic.slug} {...topic} />
        ))}
      </div>
    </>
  );
}
