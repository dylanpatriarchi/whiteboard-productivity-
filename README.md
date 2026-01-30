# 🎨 Whiteboard Productivity

> Self-hosted, open source productivity whiteboard. Your data, your control.

## Features

- 🔒 **100% Privacy** - Local data, zero tracking
- 🚀 **20+ Node Types** - Post-it, code executor, AI chat, pomodoro, and more
- 🤖 **AI Integration** - Configure OpenAI/Anthropic/Ollama via settings
- 💻 **Code Execution** - Test Node.js and Python directly
- 🎯 **Offline First** - Works without internet
- 🎨 **Minimal Design** - Dark/Light mode, clean interface

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local installation or cloud)

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whiteboard
NODE_ENV=development
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

## Tech Stack

- **Frontend:** React + Vite + Zustand + Tailwind CSS
- **Backend:** Node.js + Express + MongoDB + Mongoose
- **UI:** Minimal design with Helvetica font, dark/light mode

## License

MIT - Do whatever you want

## Contributing

PRs welcome! See nodes_todo.md for implementation roadmap.
