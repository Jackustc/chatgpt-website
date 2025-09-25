import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import NavBar from "./components/NavBar"; // ✅ 引入新组件
import AdminDashboard from "./pages/AdminDashboard";
import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <Router>
      <div>
        <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />{" "}
        {/* ✅ 传递状态 */}
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />} // ✅ 传递更新函数
          />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
