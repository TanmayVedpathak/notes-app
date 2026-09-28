import fs from "node:fs/promises";
import path from "node:path";

import type { TopicOption, TopicQuestion } from "@/types";

import { processTopicData } from "./process-topic-data";

import "server-only";

const DEFAULT_REVALIDATE_SECONDS = 60 * 60;
const DATA_DIR = path.join(process.cwd(), "data");

function getRevalidateSeconds(): number {
  const configuredValue = Number(process.env.TOPIC_REVALIDATE_SECONDS);

  return Number.isFinite(configuredValue) && configuredValue >= 0 ? configuredValue : DEFAULT_REVALIDATE_SECONDS;
}

function getApiBaseUrl(): string {
  const baseUrl = process.env.API_URL;

  if (!baseUrl) {
    throw new Error("Missing API_URL. Add API_URL=https://your-domain/path/ to .env.local.");
  }

  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function createJsonUrl(fileName: string): string {
  return new URL(`${encodeURIComponent(fileName)}.json`, getApiBaseUrl()).toString();
}

async function getApiJsonFile(fileName: string): Promise<TopicOption[] | TopicQuestion[] | null> {
  const response = await fetch(createJsonUrl(fileName), {
    next: {
      revalidate: getRevalidateSeconds(),
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to load ${fileName}.json. API returned ${response.status}.`);
  }

  return response.json();
}

async function getLocalJsonFile(fileName: string): Promise<TopicOption[] | TopicQuestion[] | null> {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");

    return JSON.parse(fileContent) as TopicOption[] | TopicQuestion[];
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw new Error(`Unable to load local file ${fileName}.json.`);
  }
}

async function getJsonFile(fileName: string): Promise<TopicOption[] | TopicQuestion[] | null> {
  if (process.env.DATA_SOURCE === "local") {
    return getLocalJsonFile(fileName);
  }

  return getApiJsonFile(fileName);
}

export async function getTopics(): Promise<TopicOption[]> {
  const data = (await getJsonFile("topic")) as TopicOption[];

  if (!data) {
    return [];
  }

  return data;
}

export async function getTopicQuestions(slug: string): Promise<TopicQuestion[] | null> {
  const data = await getJsonFile(slug);

  if (data === null) {
    return null;
  }

  return processTopicData(data);
}
