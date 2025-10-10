import React, { useState, useEffect } from "react";

function Chat() {
  const [prompt, setPrompt] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

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

  return (
    <div
      style={{
        width: "100%", // ✅ 占满全屏
        margin: "10px 0",
        padding: "0 30px", // ✅ 给左右各留 40px 空间
        boxSizing: "border-box",
      }}
    >
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
            width: "100%", // ✅ 永远占满容器
            minHeight: "150px", // ✅ 高度更明显
            fontSize: "1rem",
            padding: "10px",
            marginBottom: "20px",
            // border: "1px solid #ccc",
            // borderRadius: "4px",
            boxSizing: "border-box", // ✅ 防止 padding 挤压
          }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px 20px",
            border: "none",
            // borderRadius: "4px",
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
                // border: "1px solid #ddd",
                // borderRadius: "6px",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p>
                <strong>You:</strong> {c.prompt}
              </p>
              <p>
                <strong>Bot:</strong> {c.response}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Chat;
