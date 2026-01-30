import { useEffect, useState } from 'react';
import Header from './components/Layout/Header';
import BoardCanvas from './components/Board/BoardCanvas';
import { useBoardStore } from './store/useBoardStore';

function App() {
    const { boards, fetchBoards, createBoard } = useBoardStore();
    const [currentBoardId, setCurrentBoardId] = useState(() => {
        // Try to restore from localStorage
        return localStorage.getItem('currentBoardId') || null;
    });

    // Save currentBoardId to localStorage whenever it changes
    useEffect(() => {
        if (currentBoardId) {
            localStorage.setItem('currentBoardId', currentBoardId);
        }
    }, [currentBoardId]);

    useEffect(() => {
        // Fetch boards on mount
        fetchBoards();
    }, [fetchBoards]);

    useEffect(() => {
        // Use existing board or create one if none exist
        if (boards.length > 0) {
            // Check if saved board still exists
            if (currentBoardId) {
                const boardExists = boards.some(b => b._id === currentBoardId);
                if (!boardExists) {
                    // Saved board doesn't exist anymore, use first board
                    setCurrentBoardId(boards[0]._id);
                }
            } else {
                // No saved board, use first available
                setCurrentBoardId(boards[0]._id);
            }
        } else {
            // Only create a new board if truly none exist
            if (!currentBoardId) {
                createBoard({ title: 'My First Board' }).then((board) => {
                    setCurrentBoardId(board._id);
                });
            }
        }
    }, [boards, currentBoardId, createBoard]);

    return (
        <div className="h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex overflow-hidden">
                {currentBoardId ? (
                    <BoardCanvas boardId={currentBoardId} />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            Loading...
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
