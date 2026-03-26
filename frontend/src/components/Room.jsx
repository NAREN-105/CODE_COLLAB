import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import CodeEditor from "./CodeEditor";

const socket = io("http://localhost:5000");

export default function Room() {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [username] = useState("User" + Math.floor(Math.random() * 100));

  useEffect(() => {
    socket.emit("join-room", { roomId, username });
    socket.on("users-update", (userList) => setUsers(userList));
    socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.disconnect();
  }, [roomId]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socket.emit("chat-message", { roomId, username, message: chatInput });
    setChatInput("");
  };

  return (
    // ✅ Full screen, column layout
    <div className="flex flex-col h-screen bg-gray-900 text-white">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
        <h1 className="font-bold text-lg">CodeCollab — Room: {roomId}</h1>
        <span className="text-sm text-green-400">{users.length} online</span>
      </div>

      {/* ✅ Main area: flex-1 so it fills remaining height, overflow-hidden to contain children */}
      <div className="flex flex-1 overflow-hidden">

        {/* ✅ Editor: h-full is THE critical fix */}
        <div className="w-[70%] h-full">
          <CodeEditor socket={socket} roomId={roomId} />
        </div>

        {/* Sidebar */}
        <div className="w-[30%] flex flex-col border-l border-gray-700 overflow-hidden">
          {/* Users */}
          <div className="p-3 border-b border-gray-700 shrink-0">
            <p className="text-xs text-gray-400 uppercase mb-2">Online</p>
            {users.map((u, i) => (
              <div key={i} className="flex items-center gap-2 text-sm py-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                {u}
              </div>
            ))}
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className="text-sm">
                <span className="text-blue-400 font-medium">{m.username}: </span>
                <span className="text-gray-300">{m.message}</span>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="p-3 border-t border-gray-700 flex gap-2 shrink-0">
            <input
              className="flex-1 bg-gray-700 rounded px-2 py-1 text-sm outline-none"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}