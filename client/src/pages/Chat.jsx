import React, { useState, useEffect } from "react";

function Chat() {
  const [prompt, setPrompt] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取历史对话
  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:3001/chat/conversation", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setConversations(data);
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
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      setLoading(true); // 开始加载
      const res = await fetch("http://localhost:3001/chat/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const newConv = await res.json();
      setConversations([newConv, ...conversations]);
      setPrompt("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // 加载结束
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto" }}>
      {/* <h2>Chat</h2> */}
      <form onSubmit={handleSend}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message..."
          required
          style={{ width: "80%", padding: "10px" }}
        />
        <button type="submit" style={{ padding: "10px 15px" }}>
          Send
        </button>
      </form>

      {loading && <p>🤖 Bot is typing...</p>}

      <div style={{ marginTop: "20px" }}>
        {conversations.map((c) => (
          <div
            key={c.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
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
