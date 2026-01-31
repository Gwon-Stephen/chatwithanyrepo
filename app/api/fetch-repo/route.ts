import { NextRequest, NextResponse } from "next/server";

interface GitHubFile {
  path: string;
  content?: string;
  type: string;
}

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json();

    // Parse the GitHub URL
    const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = repoUrl.match(urlPattern);

    if (!match) {
      return NextResponse.json(
        { error: "Invalid GitHub URL" },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    // Fetch repository contents recursively
    const files = await fetchRepoContents(owner, cleanRepo);

    return NextResponse.json({
      owner,
      repo: cleanRepo,
      files,
    });
  } catch (error) {
    console.error("Error fetching repository:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository" },
      { status: 500 }
    );
  }
}

async function fetchRepoContents(
  owner: string,
  repo: string,
  path: string = ""
): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  // Add GitHub token if available
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const items = await response.json();
  const files: GitHubFile[] = [];

  // Limit to important files to avoid rate limits and context overflow
  const importantExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".h",
    ".go",
    ".rs",
    ".rb",
    ".php",
    ".md",
    ".json",
    ".yaml",
    ".yml",
  ];

  const importantFiles = ["README.md", "package.json", "requirements.txt", "Cargo.toml", "go.mod"];

  for (const item of items) {
    // Skip certain directories
    if (
      item.type === "dir" &&
      ["node_modules", ".git", "dist", "build", "coverage", ".next"].includes(
        item.name
      )
    ) {
      continue;
    }

    if (item.type === "file") {
      const isImportant =
        importantFiles.includes(item.name) ||
        importantExtensions.some((ext) => item.name.endsWith(ext));

      if (isImportant && item.size < 100000) {
        // Skip files larger than ~100KB
        try {
          const fileResponse = await fetch(item.download_url);
          const content = await fileResponse.text();
          files.push({
            path: item.path,
            content,
            type: "file",
          });
        } catch (error) {
          console.error(`Error fetching file ${item.path}:`, error);
        }
      }
    } else if (item.type === "dir" && files.length < 50) {
      // Limit total files to avoid overwhelming the system
      const subFiles = await fetchRepoContents(owner, repo, item.path);
      files.push(...subFiles);
    }
  }

  return files;
}
