# Chat with Any Repo

A browser-based service that allows users to "chat" with any GitHub repository using AI!

## Features

- Load any public GitHub repository by URL
- Ask questions about the codebase
- Get AI-powered answers using Claude (Anthropic)
- Clean, modern UI built with Next.js and Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- An Anthropic API key ([get one here](https://console.anthropic.com/))
- (Optional) GitHub Personal Access Token for higher rate limits

## Setup

1. Clone this repository:
```bash
git clone https://github.com/Gwon-Stephen/chatwithanyrepo.git
cd chatwithanyrepo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your API keys:
```bash
cp .env.example .env
```

Then edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Optionally add a GitHub token for higher rate limits:
```
GITHUB_TOKEN=your_github_token_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
2. Click "Load Repo" to fetch the repository contents
3. Ask questions about the codebase in the chat interface
4. Get AI-powered answers based on the repository's code

## How It Works

1. **Frontend**: Built with Next.js and React, featuring a clean chat interface
2. **Repository Fetching**: Uses GitHub API to fetch repository files and contents
3. **AI Processing**: Sends code context to Claude (Anthropic) for intelligent answers
4. **Smart Filtering**: Only includes relevant file types and skips large files/directories

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude API
- **API Integration**: GitHub REST API

## Limitations

- Only fetches up to 50 files to avoid rate limits and context overflow
- Files larger than 100KB are skipped
- Only includes common code file types (see `fetch-repo/route.ts` for the list)
- Skips common directories like `node_modules`, `dist`, `.git`, etc.

## Environment Variables

- `ANTHROPIC_API_KEY` (required): Your Anthropic API key
- `GITHUB_TOKEN` (optional): GitHub personal access token for higher API rate limits

## License

See [LICENSE](LICENSE) file for details.
