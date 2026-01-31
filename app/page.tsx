"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoLoaded, setRepoLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [repoContext, setRepoContext] = useState<any>(null);

  const handleLoadRepo = async () => {
    if (!repoUrl.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/fetch-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch repository");
      }

      const data = await response.json();
      setRepoContext(data);
      setRepoLoaded(true);
      setMessages([
        {
          role: "assistant",
          content: `Repository loaded! I can now answer questions about ${data.owner}/${data.repo}. It has ${data.files?.length || 0} files.`,
        },
      ]);
    } catch (error) {
      alert("Error loading repository. Please check the URL and try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !repoLoaded) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          repoContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your question.",
        },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Chat with Any Repository
        </h1>

        {!repoLoaded ? (
          <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">
              Enter a GitHub Repository URL
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleLoadRepo()}
              />
              <button
                onClick={handleLoadRepo}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
              >
                {loading ? "Loading..." : "Load Repo"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-xl flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-700">
              <p className="text-sm text-gray-400">
                Chatting with: <span className="text-white font-semibold">{repoUrl}</span>
              </p>
              <button
                onClick={() => {
                  setRepoLoaded(false);
                  setMessages([]);
                  setRepoContext(null);
                  setRepoUrl("");
                }}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300"
              >
                Change repository
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg">
                    <p>Thinking...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about the repository..."
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
