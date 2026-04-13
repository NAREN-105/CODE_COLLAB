# 🚀 CodeCollab - Real-time Collaborative Code Editor


A modern, real-time collaborative coding platform built with React, Node.js, and Socket.IO. Code together, chat together, build together.

![CodeCollab Banner](https://img.shields.io/badge/CodeCollab-v1.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen?style=for-the-badge)

---

## ✨ Features

- **🔥 Real-time Code Synchronization** - See changes as your teammates type
- **💬 Built-in Chat** - Communicate without leaving the editor
- **👥 Live User Presence** - See who's online in your room
- **🎨 Monaco Editor** - Same editor that powers VS Code
- **🌙 Dark Theme** - Easy on the eyes, powered by VS Dark theme
- **⚡ Fast & Lightweight** - WebSocket-based architecture
- **📱 Responsive Design** - Works on desktop and tablet
- **🔒 Room-based Collaboration** - Private rooms with unique IDs

---


## 🎯 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Monaco Editor** - Professional code editor
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

Check your installations:
```bash
node --version  # Should be v16+
npm --version   # Should be 7+
```

---

### 📦 Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/NAREN-105/CODE_COLLAB.git
cd CODE_COLLAB
```

#### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

---

### 🎮 Running the Application

You need **two terminal windows**:

#### Terminal 1 - Backend Server
```bash
cd backend
node src/app.js
```


You should see:
```
╔════════════════════════════════════════╗
║   🚀 CodeCollab Backend Running!      ║
║   📡 Port: 5000                       ║
║   🌐 http://localhost:5000            ║
╚════════════════════════════════════════╝
```

#### Terminal 2 - Frontend Development Server
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 4. Open Your Browser
Navigate to: `http://localhost:5173/room/your-room-name`

**Example URLs:**
- `http://localhost:5173/room/team-alpha`
- `http://localhost:5173/room/project-collab`
- `http://localhost:5173/room/hackathon-2024`

---

## 📖 How to Use

### Creating a Collaboration Session

1. **Start a Room**
   - Navigate to any URL with pattern: `/room/[room-name]`
   - Example: `http://localhost:5173/room/my-project`

2. **Share the Link**
   - Copy the URL from your browser
   - Share it with your team members
   - Everyone with the link can join!

3. **Start Coding**
   - Type in the Monaco Editor
   - Changes sync in real-time across all users
   - Use the chat to communicate

### Features Guide

#### 👥 User Presence
- See how many users are online in the top-right corner
- View all active users in the sidebar
- Green dots indicate active status

#### 💬 Chat System
- Type messages in the input field at the bottom
- Press `Enter` to send
- Messages appear instantly for all users

#### ⌨️ Code Editor
- **Syntax Highlighting** - Auto-detected for JavaScript
- **Auto-completion** - Intelligent code suggestions
- **Multi-cursor Support** - Edit multiple lines at once
- **Find & Replace** - `Ctrl+F` or `Cmd+F`

---

## 🏗️ Project Structure

```
CODE_COLLAB/
├── backend/
│   ├── src/
│   │   └── app.js              # Main server file
│   ├── package.json
│   └── .env                     # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Room.jsx        # Main room component
│   │   │   └── CodeEditor.jsx  # Monaco editor wrapper
│   │   ├── App.jsx             # App entry with routing
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── public/
│   │   └── vite.svg
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Optional: Custom configurations
MAX_USERS_PER_ROOM=50
```

### Frontend Configuration

`frontend/vite.config.js`:
```javascript
export default {
  server: {
    port: 5173,
    host: true // Expose to network
  }
}
```

---

## 🌐 Socket.IO Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomId, username, userId }` | Join a collaboration room |
| `code-change` | `{ roomId, code }` | Broadcast code changes |
| `send-message` | `{ roomId, username, message }` | Send chat message |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `active-users` | `{ users: [...] }` | List of online users |
| `user-joined` | `{ userId, username }` | New user joined |
| `user-left` | `{ userId, username }` | User disconnected |
| `code-update` | `{ code, userId }` | Code synchronized |
| `new-message` | `{ message, username, userId }` | New chat message |

---

## 🐛 Troubleshooting

### Problem: Blank Screen
**Solution:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problem: WebSocket Connection Failed
**Symptoms:** Console shows `WebSocket connection failed`

**Solution:**
1. Ensure backend is running: `cd backend && node src/app.js`
2. Check firewall isn't blocking port 5000
3. Verify `CLIENT_URL` in `.env` matches frontend URL

### Problem: Users Not Showing
**Solution:**
1. Check browser console (F12) for errors
2. Verify event names match between frontend/backend
3. Make sure you applied the latest fixes from the repo

### Problem: Code Not Syncing
**Solution:**
1. Refresh the page (`Ctrl+Shift+R` or `Cmd+Shift+R`)
2. Check if both users are in the same room ID
3. Verify Socket.IO connection in console

### Problem: Monaco Editor Not Loading
**Solution:**
```bash
cd frontend
npm install @monaco-editor/react --save
npm run dev
```

---

## 🚀 Deployment

### Deploy Backend (Render/Railway/Heroku)

1. **Set Environment Variables:**
```env
PORT=5000
CLIENT_URL=https://your-frontend-url.com
NODE_ENV=production
```

2. **Start Command:**
```bash
node src/app.js
```

### Deploy Frontend (Vercel/Netlify)

1. **Build the project:**
```bash
cd frontend
npm run build
```

2. **Update Socket URL** in `frontend/src/components/Room.jsx`:
```javascript
socketRef.current = io("https://your-backend-url.com", {
  transports: ["websocket"]
});
```

3. **Deploy the `dist` folder**

---

## 🎨 Customization

### Change Editor Theme
In `CodeEditor.jsx`:
```javascript
<Editor
  theme="vs-dark"  // Options: vs-dark, vs-light, hc-black
  // ...
/>
```

### Change Language Support
```javascript
<Editor
  defaultLanguage="javascript"  // Try: python, java, cpp, html, css
  // ...
/>
```

### Customize Colors
In `frontend/src/index.css`:
```css
:root {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --text-primary: #ffffff;
  --accent: #007acc;
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test all features before submitting PR
- Update README if adding new features

---

## 📝 Roadmap

### Version 1.1 (Coming Soon)
- [ ] Code execution environment
- [ ] Multiple programming language support
- [ ] File upload/download
- [ ] Syntax error highlighting
- [ ] User authentication

### Version 1.2
- [ ] Video/voice chat integration
- [ ] Screen sharing
- [ ] Code review tools
- [ ] Version history
- [ ] Export to GitHub

### Version 2.0
- [ ] AI-powered code suggestions
- [ ] Collaborative debugging
- [ ] Project templates
- [ ] Plugin system

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 CodeCollab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👨‍💻 Author

**NAREN-105**
- GitHub: [@NAREN-105](https://github.com/NAREN-105)
- Project: [CODE_COLLAB](https://github.com/NAREN-105/CODE_COLLAB)

---

## 🙏 Acknowledgments

- **Monaco Editor** - Microsoft's incredible editor
- **Socket.IO** - Real-time communication made easy
- **React Team** - For the amazing framework
- **Tailwind CSS** - Beautiful styling utilities
- **Vite** - Lightning-fast build tool

---

## 📞 Support

Having issues? We're here to help!

- 🐛 **Bug Reports:** [Open an Issue](https://github.com/NAREN-105/CODE_COLLAB/issues)
- 💡 **Feature Requests:** [Start a Discussion](https://github.com/NAREN-105/CODE_COLLAB/discussions)
- 📧 **Email:** your-email@example.com
- 💬 **Discord:** [Join our community](#)

---

## ⭐ Show Your Support

If you find CodeCollab useful, please consider:
- ⭐ Starring the repository
- 🍴 Forking the project
- 📢 Sharing with friends
- 🐛 Reporting bugs
- 💡 Suggesting features

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/NAREN-105/CODE_COLLAB?style=social)
![GitHub forks](https://img.shields.io/github/forks/NAREN-105/CODE_COLLAB?style=social)
![GitHub issues](https://img.shields.io/github/issues/NAREN-105/CODE_COLLAB)
![GitHub pull requests](https://img.shields.io/github/issues-pr/NAREN-105/CODE_COLLAB)

---

<div align="center">

**Built with ❤️ by developers, for developers**

[⬆ Back to Top](#-codecollab---real-time-collaborative-code-editor)
</div>
