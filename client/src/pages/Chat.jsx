import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Chat() {
  const [prompt, setPrompt] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [copied, setCopied] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(location.search);
  const initialName = qs.get("username") || ""; // 来自 /chat?username=xxx

  const [name, setName] = useState(initialName); // 当前用户名（可被编辑）
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(initialName);
  const [locked, setLocked] = useState(false); // 首次发消息后锁定

  // 没用户名就回到输入页（保持你原有流程）
  useEffect(() => {
    if (!initialName) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName]);

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
      // ✅ 首次发送后立即锁定用户名
      if (!locked) setLocked(true);

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
          body: JSON.stringify({ prompt, sessionId, username: name }),
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

  // 🔹 内联编辑逻辑
  const onEditClick = () => {
    if (locked) return; // 已锁定禁止编辑
    setEditDraft(name);
    setIsEditing(true);
  };

  const onSaveName = () => {
    const newName = editDraft.trim();
    if (!newName) return alert("用户名不能为空");
    setName(newName);
    setIsEditing(false);

    // 可选：更新 URL 上的 username，避免刷新后看到旧值
    const q = new URLSearchParams(location.search);
    q.set("username", newName);
    navigate(`/chat?${q.toString()}`, { replace: true });
  };

  const onCancelEdit = () => {
    setIsEditing(false);
    setEditDraft(name);
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
      {/* 顶部用户名区（仅在未开始聊天时显示提示） */}
      {!locked && (
        <div
          style={{
            background: "#f1f5f9",
            padding: "10px 14px",
            borderRadius: "6px",
            marginBottom: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {!isEditing ? (
            <>
              <span>
                👋 Hello, <strong>{name}</strong>
                <span
                  style={{
                    color: "#2563eb",
                    marginLeft: "8px",
                    fontWeight: 500,
                  }}
                >
                  ✨ Before start, you can modify conversation settings
                </span>
              </span>
              <button
                onClick={onEditClick}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ✏️ Edit
              </button>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
              }}
            >
              <input
                autoFocus
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                placeholder="输入新的用户名"
                style={{
                  flex: 1,
                  minWidth: "240px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                }}
              />
              <button
                onClick={onSaveName}
                style={{
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                💾 Save
              </button>
              <button
                onClick={onCancelEdit}
                style={{
                  background: "#e2e8f0",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ✖ Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* ✅ Session ID 显示区 */}
      {/* {sessionId && (
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
      )} */}

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
