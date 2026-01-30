# Whiteboard Productivity App - TODO

## ✅ Completed Features

### Core Infrastructure
- [x] Project setup (MERN stack)
- [x] MongoDB integration
- [x] REST API (boards, nodes, settings)
- [x] Basic UI with Header
- [x] Dark/Light mode toggle
- [x] Board persistence (MongoDB + localStorage)

### Canvas Features
- [x] Infinite zoom (Ctrl/Cmd + Scroll)
  - [x] Zoom to cursor (stays under mouse)
  - [x] Min/max zoom limits (0.1x - 5x)
  - [x] Zoom controls (buttons)
- [x] Infinite pan (two-finger touchpad)
  - [x] Natural scrolling
  - [x] Smooth pan
- [x] Node drag & drop
- [x] Node resize (8 handles)
- [x] Context menu (right-click)
- [x] Keyboard shortcuts
  - [x] Delete (Del/Backspace)
  - [x] Duplicate (Ctrl/Cmd + D)
  - [x] Lock/Unlock (Ctrl/Cmd + L)
  - [x] Deselect (Esc)
  - [x] Reset Zoom (Ctrl/Cmd + 0)

### Implemented Nodes
- [x] **Sticky Note**
  - [x] Text input (auto-resize textarea)
  - [x] 5 color options (yellow, blue, green, pink, purple)
  - [x] Character counter
  - [x] Auto-save (500ms debounce)
  - [x] Full drag & drop support
  - [x] Resize handles
  - [x] Context menu integration

---

## 🚀 In Progress - Priority 1 Nodes

### Task List
- [ ] Create `TaskList.jsx` component
- [ ] UI design
  - [ ] Header with title
  - [ ] Add task input + button
  - [ ] Task items with checkboxes
  - [ ] Delete task button per item
- [ ] Functionality
  - [ ] Add new task
  - [ ] Check/uncheck tasks
  - [ ] Delete tasks
  - [ ] Task completion percentage
  - [ ] Save state to MongoDB
- [ ] Styling
  - [ ] Dark/light mode support
  - [ ] Hover effects
  - [ ] Completed task styling (strikethrough)

### Pomodoro Timer
- [ ] Create `PomodoroTimer.jsx` component
- [ ] Settings (per-node)
  - [ ] Work duration (default 25 min, user configurable)
  - [ ] Break duration (default 5 min, user configurable)
  - [ ] Sound notification toggle (on/off)
- [ ] UI design
  - [ ] Timer display (MM:SS)
  - [ ] Start/Pause button
  - [ ] Reset button
  - [ ] Settings button/panel
  - [ ] Visual progress ring/circle
  - [ ] Session counter
  - [ ] Mode indicator (Work/Break)
- [ ] Functionality
  - [ ] Countdown timer
  - [ ] Auto-switch work ↔ break
  - [ ] Sound notification (Web Audio API beep)
  - [ ] Browser notification (optional)
  - [ ] Persist timer state (pause/resume after refresh)
- [ ] Styling
  - [ ] Circular progress indicator
  - [ ] Color coding (work = red, break = green)
  - [ ] Dark/light mode support

### Code Block
- [ ] Create `CodeBlock.jsx` component
- [ ] UI design
  - [ ] Language selector dropdown
  - [ ] Code editor textarea
  - [ ] Line numbers sidebar
  - [ ] Copy button
  - [ ] Dark/light theme toggle for code
- [ ] Functionality
  - [ ] Syntax highlighting (using Prism.js or Highlight.js)
  - [ ] Support for multiple languages (JS, Python, Java, HTML, CSS, etc.)
  - [ ] Tab key support (insert spaces)
  - [ ] Copy to clipboard
  - [ ] Auto-save code content
- [ ] Styling
  - [ ] Monospace font
  - [ ] Line number gutter
  - [ ] Syntax colors
  - [ ] Dark/light code themes

---

## 📅 Planned - Future Priorities

### Priority 2 - Content & Media
- [ ] **Text Block** - Rich text editor (bold, italic, headers, lists)
- [ ] **Image Node** - Upload/paste/URL images with resize
- [ ] **Drawing Canvas** - Freehand drawing with pen/eraser

### Priority 3 - Visual & Organization
- [ ] **Shape Node** - Rectangles, circles, triangles, arrows
- [ ] **Connector/Arrow** - Connect nodes with lines/arrows
- [ ] **Kanban Column** - Kanban board with cards

### Priority 4 - Advanced Features
- [ ] **Calendar Widget** - Mini calendar with events
- [ ] **AI Chat Node** - Chat with AI (requires API key in settings)
- [ ] **Link Preview** - Auto-fetch URL metadata
- [ ] **Embed Node** - YouTube, Twitter, Spotify embeds

### Priority 5 - Specialized Tools
- [ ] **Countdown Timer** - Countdown to specific date/time
- [ ] **Calculator** - Basic calculator
- [ ] **Quote/Inspiration** - Display motivational quotes
- [ ] **Weather Widget** - Weather display (requires API)

### Priority 6 - Creative & Fun
- [ ] **Color Palette** - Color picker and palette creator
- [ ] **Music Player** - Audio player with upload/link
- [ ] **Dice Roller** - Virtual dice for games/decisions

---

## 🔮 Future Enhancements

### Board Management
- [ ] Create new boards
- [ ] Delete boards
- [ ] Rename boards
- [ ] Duplicate boards
- [ ] Board templates

### Collaboration (Long-term)
- [ ] Real-time collaboration (Socket.io)
- [ ] User authentication
- [ ] Share board links
- [ ] Permissions (view/edit)

### Export/Import
- [ ] Export board as JSON
- [ ] Export board as image (PNG/SVG)
- [ ] Import board from JSON
- [ ] Export board as PDF

### Settings & Customization
- [ ] Global settings panel
- [ ] Custom themes
- [ ] Keyboard shortcut customization
- [ ] Default node sizes/colors
- [ ] Grid snap toggle
- [ ] Canvas background options

### Performance
- [ ] Virtual rendering for large boards (thousands of nodes)
- [ ] Lazy loading nodes
- [ ] Optimize re-renders
- [ ] Debounce auto-save

---

## 🐛 Known Issues

- None currently

---

## 📝 Notes

- All nodes inherit from `DraggableNode.jsx` for consistent drag/drop and resize
- All nodes auto-save to MongoDB with debouncing
- Dark/light mode should be supported by all nodes
- Context menu (duplicate, lock, delete) works with all nodes
