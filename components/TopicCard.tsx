"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { TopicOption } from "@/types";

export default function TopicCard({ title, slug, icon, alt }: TopicOption) {
  const router = useRouter();

  return (
    <div onClick={() => router.push(`/topic/${slug}`)} className="flex items-center gap-2 cursor-pointer rounded-xl p-6 bg-gray-800 dark:bg-gray-100 hover:scale-105 transition">
      <Image src={`${process.env.NEXT_PUBLIC_API_URL}${icon}`} alt={alt} width={20} height={20} />
      <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-800">{title}</h2>
    </div>
  );
}
