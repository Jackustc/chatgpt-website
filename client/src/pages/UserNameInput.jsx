import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserNameInput() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (!username.trim()) return alert("Please enter your username!");
    navigate(`/chat?username=${encodeURIComponent(username.trim())}`);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          width: "400px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>👋 Welcome to use Chat APP</h2>

        <label style={{ display: "block", textAlign: "left" }}>Username</label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            marginBottom: "20px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleStart}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          💬 Start Chat
        </button>
      </div>
    </div>
  );
}
