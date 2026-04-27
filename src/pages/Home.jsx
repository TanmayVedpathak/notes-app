import TopicCard from "../components/TopicCard";

const topics = [
  { title: "Basic", slug: "basic" },
  { title: "JavaScript", slug: "javascript" },
  { title: "React", slug: "reactjs" },
  { title: "TypeScript", slug: "typescript" },
];

export default function Home() {
  return (
    <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <TopicCard key={topic.slug} {...topic} />
      ))}
    </div>
  );
}
