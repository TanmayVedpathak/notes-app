import fs from "node:fs/promises";
import path from "node:path";

import type { TopicOption, TopicQuestion } from "@/types";

import { getGithubJsonFile } from "./github";
import { processTopicData } from "./process-topic-data";

import "server-only";

const DEFAULT_REVALIDATE_SECONDS = 60 * 60;
const DATA_DIR = path.join(process.cwd(), "data");

type JsonData = TopicOption[] | TopicQuestion[];

async function getLocalJsonFile(fileName: string): Promise<JsonData | null> {
    const filePath = path.join(DATA_DIR, "json", `${fileName}.json`);

    try {
        const fileContent = await fs.readFile(filePath, "utf-8");

        return JSON.parse(fileContent) as JsonData;
    } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
            return null;
        }

        throw new Error(`Unable to load local file ${fileName}.json.`, { cause: error });
    }
}

async function getJsonFile(fileName: string): Promise<JsonData | null> {
    const source = process.env.DATA_SOURCE;

    try {
        let data: JsonData | null;

        switch (source) {
            case "local":
                data = await getLocalJsonFile(fileName);
                break;
            case "github":
                data = await getGithubJsonFile<JsonData>(fileName);
                break;
            default:
                throw new Error(`Invalid DATA_SOURCE: ${source}`);
        }

        if (data === null) {
            console.warn("[getJsonFile] JSON file not found", { source, fileName });
        }

        return data;
    } catch (error: unknown) {
        // Log once here for all providers; preserve the original error and stack.
        console.error("[getJsonFile] Failed to load JSON data", { source, fileName }, error);
        throw error;
    }
}

export async function getTopics(): Promise<TopicOption[]> {
    const data = await getJsonFile("topic");

    if (data === null) {
        return [];
    }

    return data as TopicOption[];
}

export async function getTopicQuestions(slug: string): Promise<TopicQuestion[] | null> {
    const data = await getJsonFile(slug);

    if (data === null) {
        return null;
    }

    return processTopicData(data, slug);
}
