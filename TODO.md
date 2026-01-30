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
- [x] Node interaction model
  - [x] **Single click** - Interact with content (write, click buttons, etc.)
  - [x] **Double click** - Enable drag & resize mode with blue border
  - [x] Click outside to exit edit mode
- [x] Node resize (8 handles - blue in edit mode)
- [x] Context menu (right-click)
- [x] Keyboard shortcuts
  - [x] Delete (Del/Backspace)
  - [x] Duplicate (Ctrl/Cmd + D)
  - [x] Lock/Unlock (Ctrl/Cmd + L)
  - [x] Deselect (Esc)
  - [x] Reset Zoom (Ctrl/Cmd + 0)

### Implemented Nodes

#### ✅ Sticky Note
- [x] Text input (auto-resize textarea)
- [x] 5 color options (yellow, blue, green, pink, purple)
- [x] Character counter
- [x] Auto-save (500ms debounce)
- [x] Full drag & drop support
- [x] Resize handles
- [x] Context menu integration

#### ✅ Task List
- [x] Create `TaskList.jsx` component
- [x] UI design
  - [x] Header with title
  - [x] Add task input + button
  - [x] Task items with checkboxes
  - [x] Delete task button per item
- [x] Functionality
  - [x] Add new task (Enter or + button)
  - [x] Check/uncheck tasks
  - [x] Delete tasks (X button)
  - [x] Task completion percentage display
  - [x] Save state to MongoDB
- [x] Styling
  - [x] Dark/light mode support
  - [x] Hover effects
  - [x] Completed task styling (strikethrough)

#### ✅ Pomodoro Timer
- [x] Create `PomodoroTimer.jsx` component
- [x] Settings (per-node with modal panel)
  - [x] Work duration (text input with validation, 1-120 min)
  - [x] Break duration (text input with validation, 1-120 min)
  - [x] Sound notification toggle (on/off)
  - [x] Apply/Cancel buttons
- [x] UI design
  - [x] Timer display (MM:SS format)
  - [x] Start/Pause button
  - [x] Reset button
  - [x] Settings button/panel
  - [x] Visual progress ring/circle (SVG)
  - [x] Session counter
  - [x] Mode indicator (🍅 Focus Time / ☕ Break Time)
- [x] Functionality
  - [x] Countdown timer with setInterval
  - [x] Auto-switch work ↔ break
  - [x] Sound notification (Web Audio API 800Hz beep)
  - [x] Persist ALL state to MongoDB (pause/resume works after refresh)
  - [x] Immediate save on critical actions (start/pause/reset/settings)
- [x] Styling
  - [x] Circular SVG progress indicator
  - [x] Color coding (work = red, break = green)
  - [x] Dark/light mode support
  - [x] Background tint based on mode

#### ✅ Code Block
- [x] Create `CodeBlock.jsx` component
- [x] Install Prism.js (`npm install prismjs`)
- [x] UI design
  - [x] Language selector dropdown
  - [x] Code editor textarea
  - [x] Line numbers sidebar
  - [x] Copy button (with "Copied!" feedback)
- [x] Functionality
  - [x] Syntax highlighting (using Prism.js)
  - [x] Support for 19 languages (JS, TS, Python, Java, C, C++, C#, PHP, Ruby, Go, Rust, SQL, Bash, JSON, YAML, Markdown, CSS, SCSS, HTML)
  - [x] Tab key support (inserts 2 spaces)
  - [x] Copy to clipboard
  - [x] Auto-save code content (500ms debounce)
- [x] Styling
  - [x] Monospace font
  - [x] Line number gutter
  - [x] Syntax colors (Prism Tomorrow theme)
  - [x] Dark code editor theme
  - [x] Transparent textarea overlay technique

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

### Node Architecture
- All nodes inherit from `DraggableNode.jsx` for consistent drag/drop and resize
- All nodes auto-save to MongoDB with debouncing (500ms - 2s depending on node)
- All nodes use nullish coalescing (`??`) for content initialization to prevent undefined bugs
- Dark/light mode supported by all nodes
- Context menu (duplicate, lock, delete) works with all nodes

### Interaction Model
- **Single click**: Interact with node content (type, click buttons, check boxes)
- **Double click**: Enable edit mode for drag & resize (blue border appears)
- Edit mode shows blue border and 8 blue resize handles
- Click outside node to exit edit mode

### Dependencies
- **Frontend**: React, Zustand, Vite, Lucide React, Prism.js
- **Backend**: Express, MongoDB, Mongoose, CORS, Helmet
- **Rate Limit**: 10,000 requests per 15 minutes (development)

---

## 🎯 Next Steps

1. Test all Priority 1 nodes thoroughly
2. Fix any bugs discovered during testing
3. Begin implementing Priority 2 nodes (Text Block, Image, Drawing Canvas)
4. Add board management features (create/delete/rename boards)
5. Improve UI/UX based on user feedback
