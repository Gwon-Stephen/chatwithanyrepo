import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { message, repoContext } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build context from repository files
    let contextText = `You are analyzing the GitHub repository: ${repoContext.owner}/${repoContext.repo}\n\n`;
    contextText += "Repository contents:\n\n";

    // Include file contents in the context
    if (repoContext.files && repoContext.files.length > 0) {
      // Limit context size to avoid token limits
      const maxFiles = 20;
      const filesToInclude = repoContext.files.slice(0, maxFiles);

      for (const file of filesToInclude) {
        if (file.content) {
          contextText += `File: ${file.path}\n\`\`\`\n${file.content.slice(
            0,
            3000
          )}\n\`\`\`\n\n`;
        }
      }

      if (repoContext.files.length > maxFiles) {
        contextText += `\n(Note: Only showing ${maxFiles} of ${repoContext.files.length} files to stay within limits)\n\n`;
      }
    }

    contextText += `\nUser question: ${message}\n\nPlease provide a helpful answer based on the repository contents above.`;

    const response = await anthropic.messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: contextText,
        },
      ],
    });

    const assistantMessage = response.content[0];
    const responseText =
      assistantMessage.type === "text" ? assistantMessage.text : "";

    return NextResponse.json({
      response: responseText,
    });
  } catch (error) {
    console.error("Error calling Claude API:", error);
    return NextResponse.json(
      { error: "Failed to get response from Claude" },
      { status: 500 }
    );
  }
}
