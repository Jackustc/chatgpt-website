import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

function App() {
  return (
    <Router>
      <div>
        {/* 顶部导航栏 */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 20px",
            borderBottom: "1px solid #ddd",
            alignItems: "center",
          }}
        >
          <Link to="/" style={{ textDecoration: "none", color: "black" }}>
            <h2 style={{ margin: 0 }}>Interact with ChatGPT</h2>
          </Link>
          <div>
            <Link to="/login" style={{ marginRight: "15px" }}>
              Login
            </Link>
            <Link to="/register">Register</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
