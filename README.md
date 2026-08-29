# Interview Notes

A responsive interview-preparation notes app built with Next.js. The home page loads a catalog of topics from a JSON API, and each topic page provides searchable questions, subtopic navigation, rich answer blocks, and light/dark theme support.

## Features

- Topic catalog with remote icons
- Topic switching without returning to the home page
- Debounced search across questions and answer content
- Desktop and mobile subtopic navigation
- Rich answers with paragraphs, headings, code, lists, tables, badges, and callouts
- Remembered scroll position for each topic
- Light and dark themes
- Incrementally revalidated API data

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint

## Prerequisites

- Node.js 20.9 or newer
- npm
- A static JSON endpoint containing the topic catalog and topic files described below
- The local `eslint-config-custom` package at `../../eslint-config-custom`, relative to this project

The last requirement comes from the current `file:../../eslint-config-custom` development dependency. The directory must exist before installing dependencies from a fresh checkout.

## Installation

1. Clone the repository and enter the project directory.

   ```bash
   git clone <repository-url>
   cd notes-app-next
   ```

2. Make sure the shared ESLint package is available at `../../eslint-config-custom`.

3. Install the locked dependencies.

   ```bash
   npm ci
   ```

4. Create `.env.local` in the project root.

   ```dotenv
   NEXT_PUBLIC_API_URL
   NEXT_PUBLIC_TOPIC_REVALIDATE_SECONDS
   ```

5. Start the development server.

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable                               | Required | Default               | Purpose                                                                                                                   |
| -------------------------------------- | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                  | Yes      | None                  | Public base URL used to fetch JSON data and render topic icons. Include a trailing `/` so icon URLs are formed correctly. |
| `API_URL`                              | No       | `NEXT_PUBLIC_API_URL` | Server-only override for the JSON API base URL. Topic icons still use `NEXT_PUBLIC_API_URL`.                              |
| `NEXT_PUBLIC_TOPIC_REVALIDATE_SECONDS` | No       | `3600`                | Cache revalidation interval in seconds. Use `0` to revalidate on every request.                                           |

Environment files are ignored by Git. Restart the development server after changing them. Values prefixed with `NEXT_PUBLIC_` are included in the browser bundle at build time and must not contain secrets.

Remote topic images are currently restricted to `NEXT_PUBLIC_API_URL/img/**` in `next.config.ts`. Add a matching `images.remotePatterns` entry before using an API that serves icons from another host.

## API Data Format

The configured API URL must expose a `topic.json` catalog and one JSON file for every topic slug.

For example, `topic.json`:

```json
[
  {
    "title": "JavaScript",
    "slug": "javascript",
    "icon": "img/javascript.svg",
    "alt": "JavaScript logo"
  }
]
```

The corresponding `javascript.json`:

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

Topic slugs become routes such as `/topic/javascript`. Supported answer block types are `h4`, `paragraph`, `bold`, `info`, `warn`, `badge`, `code`, `list`, and `table`. Unknown or malformed answer blocks are ignored while the data is normalized.

## Available Scripts

| Command         | Description                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`   | Starts the local development server on port 3000.                                                                                |
| `npm run lint`  | Checks the project with ESLint.                                                                                                  |
| `npm run build` | Creates an optimized production build. The configured API must be reachable because topic routes are generated during the build. |
| `npm run start` | Serves a completed production build.                                                                                             |

To verify the production workflow locally:

```bash
npm run lint
npm run build
npm run start
```

## How It Works

1. The home page fetches `topic.json` and displays one card per topic.
2. Next.js generates a `/topic/[slug]` route for each safe slug in the catalog.
3. A topic route fetches `<slug>.json`, validates and normalizes its answer blocks, and renders the questions.
4. Search runs in the browser against normalized question and answer text.
5. API responses are cached and revalidated using `NEXT_PUBLIC_TOPIC_REVALIDATE_SECONDS`.

The app returns a not-found page when a topic file responds with HTTP 404. Other API failures are handled by the application error page.

## Project Structure

```text
app/                 App Router pages, layouts, and route states
components/          Shared UI and topic-page components
context/             Theme state and persistence
hooks/               Search debounce and topic scroll behavior
lib/                 API access, data normalization, and utilities
public/              Local interface icons
types/               Shared TypeScript data models
```
