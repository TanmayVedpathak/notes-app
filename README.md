# Interview Notes

A responsive interview-preparation app built with Next.js. Load topic catalogs and questions from local JSON files or a GitHub repository, then browse searchable answers with subtopic navigation and light/dark themes.

## Features

- Topic catalog with local or remote icons
- Topic switching without returning to the home page
- Debounced search across questions and answer content
- Desktop and mobile subtopic navigation
- Rich answers with headings, paragraphs, code, nested lists, tables, badges, and callouts
- Remembered scroll position for each topic
- Light and dark themes
- Cached GitHub data with configurable revalidation
- Contextual error logs and warnings for missing files and invalid content

## Tech Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, and ESLint.

## Installation

1. Install Node.js 20.9 or newer and npm, then clone this repository and enter its directory.
2. Configure the local ESLint dependency before installing packages. The project imports `eslint-config-custom/next` in `eslint.config.mjs`, with `"eslint-config-custom": "file:../../eslint-config-custom"` in `package.json`.

   Clone the configuration and adjust the `file:` path to match its location relative to this project:

   ```bash
   git clone https://github.com/TanmayVedpathak/eslint-config-custom.git <preferred-location>
   ```

   For a sibling checkout, use `"eslint-config-custom": "file:../eslint-config-custom"`. To use another configuration, update both the dependency and `eslint.config.mjs`.

3. Install dependencies:

   ```bash
   npm install
   ```

   Use `npm ci` instead when the lock file matches `package.json` and the local dependency is available at its configured path.

4. Create `.env.local` in the project root using one of the configurations below. You can also use `.env`; `.env.local` takes precedence for matching variables.
5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open http://localhost:3000.

## Data Sources

Set `DATA_SOURCE` explicitly to `local` or `github`. Missing or unsupported values throw an error. The previous `api` source and `API_URL` setting are no longer used.

### Local JSON files

```dotenv
DATA_SOURCE=local
```

Create these files relative to the project root:

```text
data/
  json/
    topic.json
    javascript.json
    react.json
```

`topic.json` contains the catalog, and each `<slug>.json` contains that topic's questions. The `data/` directory is ignored by Git, so provision it separately in environments using local data. Local files are read through the filesystem; `TOPIC_REVALIDATE_SECONDS` only configures GitHub fetch caching.

### GitHub repository

```dotenv
DATA_SOURCE=github
GITHUB_OWNER=your-owner
GITHUB_REPO=your-repository
GITHUB_BRANCH=main
GITHUB_DATA_PATH=json
GITHUB_TOKEN=your-token
TOPIC_REVALIDATE_SECONDS=3600
```

Store `topic.json` and the topic files under `GITHUB_DATA_PATH` in the selected repository and branch. Set `GITHUB_DATA_PATH=` to use the repository root. The server requests raw JSON through GitHub's repository contents API, with the token in the authorization header. The implementation requires a token even for public repositories; it must have read access to the repository contents.

## Environment Variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATA_SOURCE` | Yes | None | Selects `local` or `github`. |
| `GITHUB_OWNER` | For GitHub | None | Repository owner or organization. |
| `GITHUB_REPO` | For GitHub | None | Repository name. |
| `GITHUB_TOKEN` | For GitHub | None | Server-only token with repository contents read access. |
| `GITHUB_BRANCH` | No | `main` | GitHub branch or ref to read. |
| `GITHUB_DATA_PATH` | No | `json` | Directory containing JSON files; an empty value selects the repository root. |
| `TOPIC_REVALIDATE_SECONDS` | No | `3600` | GitHub fetch revalidation interval in seconds; `0` disables fetch caching. |

The revalidation setting must convert to a finite, nonnegative number. Invalid or negative values fall back to `3600`; an explicitly empty value converts to `0`.

Environment files are ignored by Git. Restart the development server after changing them, and configure the required variables in production and build environments. Keep `GITHUB_TOKEN` server-only; do not give it a `NEXT_PUBLIC_` prefix.

## JSON Data Format

Both sources use the same catalog and question format.

Example `topic.json`:

```json
[
  {
    "title": "JavaScript",
    "slug": "javascript",
    "icon": "/img/javascript.png",
    "alt": "JavaScript logo"
  }
]
```

Icon paths are used directly. `/img/javascript.png` resolves to `public/img/javascript.png`. Remote icons currently allow `https://tanmayvedpathak.github.io/interview-notes/img/**`; update `images.remotePatterns` in `next.config.ts` to use another remote location.

Example `javascript.json`:

```json
[
  {
    "id": "js-1",
    "topic": "JavaScript",
    "subTopic": "Fundamentals",
    "difficulty": "Easy",
    "question": "What is a closure?",
    "answer": [
      {
        "type": "paragraph",
        "text": "A closure is a function together with its lexical environment."
      }
    ]
  }
]
```

Topic slugs become routes such as `/topic/javascript` and must contain only letters, numbers, underscores, or hyphens. Each question needs a nonempty `question` string. IDs may be strings or numbers; missing IDs become `index-<position>`. The normalizer generates `searchableText` from questions and answers, so it does not need to be stored in JSON.

Supported answer block types are `h4`, `h5`, `paragraph`, `bold`, `info`, `warn`, `badge`, `code`, `list`, and `table`. Rich text supports inline `text`, `badge`, and `code` content. Lists support nested lists, and table cells support primitive values or rich text. See `types/index.ts` for the data types and `lib/process-topic-data.ts` for normalization rules.

## Error Handling and Logs

Logs use `console.error` and `console.warn` in development and production. Check the development terminal or your hosting provider's server logs. The application error page also logs its received error in the browser console.

| Log message | Context and behavior |
| --- | --- |
| `[getJsonFile] Failed to load JSON data` | Logs `source`, `fileName`, and the original error for configuration, fetch, file-read, or JSON-parsing failures; rethrows the error. |
| `[getJsonFile] JSON file not found` | Warns with `source` and `fileName` when a local file is missing or GitHub returns HTTP 404. |
| `[processTopicData] Expected an array of questions` | Warns with `topicSlug` and returns an empty question list for non-array input. |
| `[processTopicData] Skipped invalid topic content` | Warns with `topicSlug`, `skippedQuestions`, and `skippedBlocks` when invalid question entries or unsupported answer blocks are skipped. |
| `[processTopicData] Failed to process question` | Logs `topicSlug`, the zero-based `questionIndex`, and the original error; rethrows unexpected processing failures. |

A missing catalog produces an empty topic list. A missing topic file displays the not-found page. Other load or processing failures propagate to the application error boundary during page rendering; failures during static generation can fail the build.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local development server on port 3000. |
| `npm run lint` | Checks the project with ESLint. |
| `npm run build` | Creates a production build and generates topic routes using the configured data source. |
| `npm run start` | Serves a completed production build. |
| `npx tsc --noEmit` | Checks TypeScript types without generating output. |

The configured data source must be available during the build: provide the local JSON files or GitHub credentials and network access. To verify the production workflow locally:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

On Windows, if PowerShell blocks npm's script wrapper, use `npm.cmd` and `npx.cmd` for these commands.

## How It Works

1. The home page loads `topic.json` through `lib/api.ts` and displays a card per topic.
2. Next.js generates `/topic/[slug]` routes for safe catalog slugs during the build.
3. A topic page loads the catalog and `<slug>.json` concurrently.
4. `lib/process-topic-data.ts` normalizes the questions and answers and builds searchable text.
5. Search runs in the browser against the normalized text.
6. GitHub responses use `TOPIC_REVALIDATE_SECONDS` and cache tags `github-json` and `topic-<fileName>`.

## Project Structure

```text
app/                       App Router pages, layouts, and route states
components/                Shared UI and topic-page components
context/                   Theme state and persistence
data/json/                 Local catalog and topic files (ignored by Git)
hooks/                     Search debounce and topic scroll behavior
lib/api.ts                 Data-source selection, local reads, and load logging
lib/github.ts              Authenticated GitHub JSON requests
lib/process-topic-data.ts  Answer normalization, searchable text, and processing logs
lib/utils.ts               Slug and subtopic helpers
public/                    Interface icons and local topic images
types/                     Shared TypeScript data models
```
