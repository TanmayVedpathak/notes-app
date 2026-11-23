import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

type GitHubPushEvent = {
    ref: string;
    deleted?: boolean;
    repository?: {
        full_name: string;
    };
};

function verifyGithubSignature(body: string, signature: string | null, secret: string): boolean {
    if (!signature) return false;

    const expectedSignature = "sha256=" + createHmac("sha256", secret).update(body, "utf8").digest("hex");

    const actual = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (actual.length !== expected.length) {
        return false;
    }

    return timingSafeEqual(actual, expected);
}

export async function POST(request: NextRequest) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
        console.error("Missing GITHUB_WEBHOOK_SECRET");

        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // 1. Read the original request body
    const body = await request.text();

    // 2. Verify GitHub's HMAC-SHA256 signature
    const signature = request.headers.get("x-hub-signature-256");

    if (!verifyGithubSignature(body, signature, secret)) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    // 3. Check GitHub event type
    const event = request.headers.get("x-github-event");

    if (event !== "push") {
        return NextResponse.json({
            message: "Event ignored",
        });
    }

    // 4. Parse verified payload
    let payload: GitHubPushEvent;

    try {
        payload = JSON.parse(body) as GitHubPushEvent;
    } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // 5. Verify repository and branch
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";

    const expectedRepo = `${owner}/${repo}`;
    const expectedRef = `refs/heads/${branch}`;

    if (!owner || !repo || payload.repository?.full_name !== expectedRepo || payload.ref !== expectedRef || payload.deleted) {
        return NextResponse.json({
            message: "Repository or branch ignored",
        });
    }

    // 6. Invalidate all cached GitHub JSON
    revalidateTag("github-json", { expire: 0 });

    console.log("GitHub JSON cache invalidated");

    return NextResponse.json({
        success: true,
        message: "GitHub JSON cache invalidated",
    });
}
