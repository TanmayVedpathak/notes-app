import { useNavigate } from "react-router-dom";

export default function TopicCard({ title, slug }) {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/topic/${slug}`)} className="cursor-pointer rounded-xl p-6 bg-gray-800 dark:bg-gray-100 hover:scale-105 transition">
      <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-800">{title}</h2>
    </div>
  );
}
