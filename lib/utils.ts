export function formatSlugTitle(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function createSubtopicId(subtopic: string): string {
  const normalized = subtopic
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `subtopic-${normalized || "section"}`;
}

export function isSafeTopicSlug(slug: string): boolean {
  return /^[a-z0-9_-]+$/i.test(slug);
}
