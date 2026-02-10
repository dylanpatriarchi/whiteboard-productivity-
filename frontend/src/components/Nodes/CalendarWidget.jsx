import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useNodeStore } from '../../store/useNodeStore';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const EVENT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function CalendarWidget({ node }) {
    const { updateNodeLocal, updateNode } = useNodeStore();

    const content = {
        events: node.content?.events ?? [],
        viewYear: node.content?.viewYear ?? new Date().getFullYear(),
        viewMonth: node.content?.viewMonth ?? new Date().getMonth(),
    };

    const [selectedDate, setSelectedDate] = useState(null);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventColor, setNewEventColor] = useState(EVENT_COLORS[0]);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            updateNode(node._id, { content });
        }, 500);
        return () => clearTimeout(timer);
    }, [JSON.stringify(content)]);

    const save = (newContent) => {
        updateNodeLocal(node._id, { content: { ...content, ...newContent } });
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const prevMonth = () => {
        let m = content.viewMonth - 1, y = content.viewYear;
        if (m < 0) { m = 11; y--; }
        save({ viewMonth: m, viewYear: y });
    };

    const nextMonth = () => {
        let m = content.viewMonth + 1, y = content.viewYear;
        if (m > 11) { m = 0; y++; }
        save({ viewMonth: m, viewYear: y });
    };

    const getDateStr = (day) => {
        return `${content.viewYear}-${String(content.viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getEventsForDate = (dateStr) => {
        return content.events.filter(e => e.date === dateStr);
    };

    const addEvent = () => {
        if (!newEventTitle.trim() || !selectedDate) return;
        const newEvents = [...content.events, { date: selectedDate, title: newEventTitle.trim(), color: newEventColor }];
        save({ events: newEvents });
        setNewEventTitle('');
        setShowAddEvent(false);
    };

    const removeEvent = (index) => {
        const eventIndex = content.events.findIndex((e, i) => {
            const matchingEvents = content.events.filter(ev => ev.date === selectedDate);
            return e.date === selectedDate && matchingEvents.indexOf(e) === index;
        });
        if (eventIndex !== -1) {
            const newEvents = content.events.filter((_, i) => i !== eventIndex);
            save({ events: newEvents });
        }
    };

    const daysInMonth = getDaysInMonth(content.viewYear, content.viewMonth);
    const firstDay = getFirstDayOfMonth(content.viewYear, content.viewMonth);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <ChevronLeft size={18} />
                </button>
                <span className="font-semibold text-sm">
                    {MONTH_NAMES[content.viewMonth]} {content.viewYear}
                </span>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 text-center text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                {DAY_NAMES.map(d => (
                    <div key={d} className="py-1 font-medium">{d}</div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 flex-1 text-center text-sm">
                {days.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;
                    const dateStr = getDateStr(day);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    const dayEvents = getEventsForDate(dateStr);

                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                            className={`py-1 relative flex flex-col items-center justify-center transition-colors
                                ${isToday ? 'font-bold' : ''}
                                ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                            `}
                        >
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs
                                ${isToday ? 'bg-blue-500 text-white' : ''}
                            `}>
                                {day}
                            </span>
                            {dayEvents.length > 0 && (
                                <div className="flex gap-0.5 mt-0.5">
                                    {dayEvents.slice(0, 3).map((e, j) => (
                                        <div key={j} className="w-1 h-1 rounded-full" style={{ backgroundColor: e.color }} />
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected date events */}
            {selectedDate && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-2 max-h-32 overflow-y-auto">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {selectedDate}
                        </span>
                        <button
                            onClick={() => setShowAddEvent(!showAddEvent)}
                            className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-500"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {showAddEvent && (
                        <div className="flex gap-1 mb-2">
                            <input
                                type="text"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                                placeholder="Event title..."
                                className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none"
                                autoFocus
                            />
                            <div className="flex gap-0.5 items-center">
                                {EVENT_COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setNewEventColor(c)}
                                        className={`w-3 h-3 rounded-full ${newEventColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                            <button onClick={addEvent} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                                Add
                            </button>
                        </div>
                    )}

                    {selectedEvents.length === 0 && !showAddEvent && (
                        <p className="text-xs text-gray-400">No events</p>
                    )}
                    {selectedEvents.map((evt, i) => (
                        <div key={i} className="flex items-center gap-2 py-0.5 group">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: evt.color }} />
                            <span className="text-xs flex-1">{evt.title}</span>
                            <button
                                onClick={() => removeEvent(i)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            >
                                <X size={10} className="text-red-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
