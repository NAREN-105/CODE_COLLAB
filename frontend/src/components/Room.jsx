import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import CodeEditor from "./CodeEditor";

export default function Room() {
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [username] = useState("User" + Math.floor(Math.random() * 100));

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket"],
      });

      socketRef.current.emit("join-room", { roomId, username });

      // Try both event name variants (backend may use either)
      socketRef.current.on("active-users", (data) => {
        setUsers(Array.isArray(data) ? data : data.users || []);
      });
      socketRef.current.on("users-update", (data) => {
        setUsers(Array.isArray(data) ? data : data.users || []);
      });

      socketRef.current.on("new-message", (msg) => setMessages((prev) => [...prev, msg]));
      socketRef.current.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, username]);

  const sendMessage = () => {
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit("send-message", { roomId, username, message: chatInput });
    setChatInput("");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      width: "100vw",
      backgroundColor: "#0d1117",
      color: "#c9d1d9",
      fontFamily: "sans-serif",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        backgroundColor: "#161b22",
        borderBottom: "1px solid #30363d",
        flexShrink: 0,
      }}>
        <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
          CodeCollab — Room: {roomId}
        </h1>
        <span style={{ color: "#3fb950", fontSize: "13px" }}>
          {users.length} online
        </span>
      </div>

      {/* Main area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Editor — THE KEY FIX: explicit pixel height via flex */}
        <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
          <CodeEditor socket={socketRef.current} roomId={roomId} />
        </div>

        {/* Sidebar */}
        <div style={{
          width: "300px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #30363d",
          backgroundColor: "#161b22",
          overflow: "hidden",
        }}>
          {/* Users */}
          <div style={{
            padding: "12px",
            borderBottom: "1px solid #30363d",
            flexShrink: 0,
          }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Online
            </p>
            {users.map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", padding: "3px 0" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3fb950", display: "inline-block" }}></span>
                {typeof u === "string" ? u : u.username || u.name || JSON.stringify(u)}
              </div>
            ))}
          </div>

          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ fontSize: "13px", marginBottom: "8px" }}>
                <span style={{ color: "#58a6ff", fontWeight: "600" }}>{m.username}: </span>
                <span style={{ color: "#c9d1d9" }}>{m.message}</span>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div style={{
            padding: "12px",
            borderTop: "1px solid #30363d",
            display: "flex",
            gap: "8px",
            flexShrink: 0,
          }}>
            <input
              style={{
                flex: 1,
                backgroundColor: "#21262d",
                border: "1px solid #30363d",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "13px",
                color: "#c9d1d9",
                outline: "none",
              }}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Message..."
            />
            <button
              onClick={sendMessage}
              style={{
                backgroundColor: "#238636",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "13px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}