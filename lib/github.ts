import "server-only";

function createGithubJsonUrl(fileName: string): string {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";

    const dataPath = (process.env.GITHUB_DATA_PATH ?? "json").replace(/^\/+|\/+$/g, "");

    if (!owner || !repo) {
        throw new Error("Missing GitHub repository configuration.");
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(fileName)) {
        throw new Error("Invalid JSON filename.");
    }

    const path = [dataPath, `${fileName}.json`]
        .filter(Boolean)
        .map((part) => part.split("/").map(encodeURIComponent).join("/"))
        .join("/");

    const url = new URL(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`);

    url.searchParams.set("ref", branch);

    return url.toString();
}

export async function getGithubJsonFile<T>(fileName: string): Promise<T | null> {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        throw new Error("Missing GITHUB_TOKEN.");
    }

    const response = await fetch(createGithubJsonUrl(fileName), {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.raw+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        next: {
            revalidate: false,
            tags: ["github-json", `topic-${fileName}`],
        },
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Unable to load ${fileName}.json from GitHub. Status: ${response.status}.`);
    }

    return (await response.json()) as T;
}
