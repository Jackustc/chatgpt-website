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

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto" }}>
      <h2>All Conversations (Admin)</h2>
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
