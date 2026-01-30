import { useEffect, useState } from 'react';
import Header from './components/Layout/Header';
import BoardCanvas from './components/Board/BoardCanvas';
import { useBoardStore } from './store/useBoardStore';

function App() {
    const { boards, fetchBoards, createBoard } = useBoardStore();
    const [currentBoardId, setCurrentBoardId] = useState(null);

    useEffect(() => {
        // Fetch boards on mount
        fetchBoards();
    }, []);

    useEffect(() => {
        // Auto-create a board if none exist
        if (boards.length === 0 && !currentBoardId) {
            createBoard({ title: 'My First Board' }).then((board) => {
                setCurrentBoardId(board._id);
            });
        } else if (boards.length > 0 && !currentBoardId) {
            setCurrentBoardId(boards[0]._id);
        }
    }, [boards]);

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
