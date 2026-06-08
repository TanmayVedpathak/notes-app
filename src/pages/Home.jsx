import { Helmet } from "react-helmet-async";

import TopicCard from "../components/TopicCard";

export default function Home({ topics }) {
  return (
    <>
      <Helmet>
        <title>Notes App</title>
      </Helmet>

      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics?.map((topic) => (
          <TopicCard key={topic.slug} {...topic} />
        ))}
      </div>
    </>
  );
}
