import type { Metadata } from "next";
import { notFound } from "next/navigation";

import TopicClient from "@/components/topic/TopicClient";

import { getTopicQuestions, getTopics } from "@/lib/api";
import { formatSlugTitle, isSafeTopicSlug } from "@/lib/utils";

type TopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topicTitle = formatSlugTitle(slug);

  return {
    title: `${topicTitle} Notes`,
    description: `Interview questions and notes for ${topicTitle}.`,
  };
}

export async function generateStaticParams() {
  const topics = await getTopics();

  return topics.filter((topic) => isSafeTopicSlug(topic.slug)).map((topic) => ({ slug: topic.slug }));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;

  if (!isSafeTopicSlug(slug)) {
    notFound();
  }

  const [topics, questions] = await Promise.all([getTopics(), getTopicQuestions(slug)]);

  if (questions === null) {
    notFound();
  }

  return <TopicClient key={slug} slug={slug} topics={topics} questions={questions} />;
}
