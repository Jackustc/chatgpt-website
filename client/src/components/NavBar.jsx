import { Link, useNavigate } from "react-router-dom";

function NavBar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // ✅ 清除 role
    setIsLoggedIn(false); // ✅ 更新父组件状态
    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 30px",
        // borderBottom: "1px solid #ddd",
        alignItems: "center",
      }}
    >
      {/* <Link to="/" style={{ textDecoration: "none", color: "black" }}>
        <h2 style={{ margin: 0 }}>Interact with ChatGPT</h2>
      </Link> */}
      <Link to="/" style={{ textDecoration: "none", color: "black" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: "bold",
            marginTop: "1rem ",
          }}
        >
          Interact with ChatGPT
        </h1>
      </Link>

      <div
        style={{
          margin: 0,
          marginTop: "1rem ",
        }}
      >
        {isLoggedIn ? (
          <>
            {/* ✅ 只有管理员能看到 Admin */}
            {role === "admin" && (
              <Link to="/admin" style={{ marginRight: "15px" }}>
                Admin
              </Link>
            )}
            <span
              onClick={handleLogout}
              style={{
                marginLeft: "15px",
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
            >
              Logout
            </span>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: "15px" }}>
              Login
            </Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
