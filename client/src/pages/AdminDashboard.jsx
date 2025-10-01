import React, { useEffect, useState } from "react";

function AdminDashboard() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3001/chat/conversation/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch((err) => console.error(err));
  }, []);

  const handleDownload = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/chat/conversation/all/csv", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "conversations.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>All Conversations (Admin)</h2>
        <button
          onClick={handleDownload}
          style={{
            cursor: "pointer",
            padding: "6px 12px",
            // backgroundColor: "#007bff",
            // color: "white",
            // border: "none",
            // borderRadius: "4px",
          }}
        >
          Download CSV
        </button>
      </div>

      <table
        border="1"
        cellPadding="6"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Prompt</th>
            <th>Response</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {conversations.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.user.username}</td>
              <td>{c.prompt}</td>
              <td>{c.response}</td>
              <td>{new Date(c.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
