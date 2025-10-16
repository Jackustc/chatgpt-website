import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Chat() {
  const [prompt, setPrompt] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [copied, setCopied] = useState(false);

  // 获取历史对话
  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setConversations([]);
        return;
      }

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/conversation`,
          {
            headers,
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setConversations(data);
        } else {
          setConversations([]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchConversations();
  }, []);

  // 发送新对话
  const handleSend = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const headers = token
        ? {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        : { "Content-Type": "application/json" };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/conversation`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ prompt, sessionId }),
        }
      );

      const newConv = await res.json();

      // ✅ 如果是本页第一次发消息，后端会回 sessionId，保存到内存
      if (!sessionId && newConv.sessionId) {
        setSessionId(newConv.sessionId);
      }

      setConversations([newConv, ...conversations]);
      setPrompt("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 复制功能
  const handleCopy = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      style={{
        width: "100%",
        margin: "10px 0",
        padding: "0 30px",
        boxSizing: "border-box",
      }}
    >
      {/* ✅ Session ID 显示区 */}
      {sessionId && (
        <div
          style={{
            background: "#f1f5f9",
            padding: "10px 14px",
            borderRadius: "6px",
            marginBottom: "15px",
            fontSize: "14px",
            color: "#334155",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            🎟 <strong>Session ID:</strong> {sessionId}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: "#e2e8f0",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>
      )}

      <form onSubmit={handleSend} style={{ textAlign: "left" }}>
        <label
          htmlFor="prompt"
          style={{ display: "block", fontSize: "1.2rem", marginBottom: "10px" }}
        >
          Enter your prompt:
        </label>

        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything..."
          required
          style={{
            width: "100%",
            minHeight: "150px",
            fontSize: "1rem",
            padding: "10px",
            marginBottom: "20px",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Submit
        </button>
      </form>

      {loading && <p>🤖 Bot is typing...</p>}

      <div style={{ marginTop: "20px" }}>
        {Array.isArray(conversations) &&
          conversations.map((c, index) => (
            <div
              key={`${c.sessionId || "temp"}-${c.id || index}`}
              style={{
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p>
                <strong>You:</strong> {c.prompt}
              </p>
              <div
                style={{
                  marginTop: "8px",
                  padding: "10px",
                  background: "#f9f9f9",
                  borderRadius: "4px",
                }}
              >
                <strong>Bot:</strong>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {c.response}
                </ReactMarkdown>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Chat;
