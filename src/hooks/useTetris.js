import { useCallback, useState } from "react";
import { getRandomBlock, hasCollisions, useTetrisBoard } from "./useTetrisBoard";
import { useInterval } from "./useInterval";

const TickSpeed = {
    Normal: 800,
    Sliding: 100,
}

export function useTetris() {
    const [isPlaying, setIsPalying] = useState(false);
    const [tickSpeed, setTickSpeed] = useState(TickSpeed || null);
    const [isCommitting, setIsCommitting] = useState(false);
    const [upcomingBlocks, setUpComingBlocks] = useState([]);

    const [
        { board, droppingRow, droppingColumn, droppingBlock, droppingShape },
        dispatchBoardState,
    ] = useTetrisBoard();

    const startGame = useCallback(() => {
        const startingBlocks = [
            getRandomBlock(),
            getRandomBlock(),
            getRandomBlock(),
        ]
        setUpComingBlocks(startingBlocks);
        setIsPalying(true);
        setTickSpeed(TickSpeed.Normal);
        dispatchBoardState({ type: 'start' });
    }, [dispatchBoardState]);

    const commitPosition = useCallback(() => {
        if (!hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
            setIsCommitting(false);
            setTickSpeed(TickSpeed.Normal);
            return;
        }

        const newBoard = board ? JSON.parse(JSON.stringify(board)) : null;
        addShapeToBoard(newBoard, droppingBlock, droppingShape, droppingRow, droppingColumn);

        const newUpComingBlocks = upcomingBlocks ? JSON.parse(JSON.stringify(upcomingBlocks)) : null;
        const newBlock = newUpComingBlocks.pop();
        newUpComingBlocks.unshift(getRandomBlock());

        setTickSpeed(TickSpeed.Normal);
        setUpComingBlocks(newUpComingBlocks);
        dispatchBoardState({ type: 'commit', newBoard, newBlock });
        setIsCommitting(false);
    }, [board, dispatchBoardState, droppingBlock, droppingColumn, droppingRow, droppingShape]);

    const gameTick = useCallback(() => {
        if (isCommitting) {
            commitPosition();
        } else if (hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)
        ) {
            setTickSpeed(TickSpeed.Sliding);
            setIsCommitting(true);
        } else {
            dispatchBoardState({ type: 'drop' });
        }
    }, [board]);

    useInterval(() => {
        if (!isPlaying) {
            return;
        }
        gameTick();
    }, tickSpeed);

    const renderedBoard = board ? JSON.parse(JSON.stringify(board)) : null;

    if (isPlaying && droppingShape) {
        addShapeToBoard(renderedBoard, droppingBlock, droppingShape, droppingRow, droppingColumn);
    }

    function addShapeToBoard(board, droppingBlock, droppingShape, droppingRow, droppingColumn) {
        droppingShape.filter((row) => row.some((isSet) => isSet))
            .forEach((row, rowIndex) => {
                row.forEach((isSet, colIndex) => {
                    if (isSet) {
                        console.log({droppingRow});
                        console.log({rowIndex});
                        console.log({droppingColumn});
                        console.log({colIndex});
                        board[droppingRow + rowIndex][droppingColumn + colIndex] = droppingBlock;
                    }
                });
            });
    }

    return {
        board: renderedBoard,
        startGame,
        isPlaying,
    };
}