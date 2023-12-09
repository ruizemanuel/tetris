import { useCallback, useEffect, useState } from "react";
import { BOARD_HEIGHT, getEmptyBoard, getRandomBlock, hasCollisions, useTetrisBoard } from "./useTetrisBoard";
import { useInterval } from "./useInterval";
import { SHAPES } from "../helpers/utils";

const TickSpeed = {
    Normal: 800,
    Sliding: 100,
    Fast: 50,
}

export function useTetris() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [tickSpeed, setTickSpeed] = useState(TickSpeed || null);
    const [isCommitting, setIsCommitting] = useState(false);
    const [upcomingBlocks, setUpComingBlocks] = useState([]);
    const [score, setScore] = useState(0);

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
        setScore(0);
        setIsCommitting(false);
        setIsPlaying(true);
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

        let numCleared = 0;
        for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
            if (newBoard[row].every((entry) => entry !== 'empty')) {
                numCleared++;
                newBoard.splice(row, 1);
            }
        }

        const newUpComingBlocks = upcomingBlocks ? JSON.parse(JSON.stringify(upcomingBlocks)) : null;
        const newBlock = newUpComingBlocks.pop();
        newUpComingBlocks.unshift(getRandomBlock());

        if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) {
            setIsPlaying(false);
            setTickSpeed(null);
        } else {
            setTickSpeed(TickSpeed.Normal);
        }
        setUpComingBlocks(newUpComingBlocks);
        setScore((prevScore) => prevScore + getPoints(numCleared));
        dispatchBoardState({
            type: 'commit',
            newBoard: [...getEmptyBoard(BOARD_HEIGHT - newBoard.length), ...newBoard],
            newBlock,
        });
        setIsCommitting(false);

    }, [board, dispatchBoardState, droppingBlock, droppingColumn, droppingRow, droppingShape, upcomingBlocks]);

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
    }, [
        board,
        commitPosition,
        dispatchBoardState,
        droppingColumn,
        droppingRow,
        droppingShape,
        isCommitting,
    ]);

    useInterval(() => {
        if (!isPlaying) {
            return;
        }
        gameTick();
    }, tickSpeed);

    useEffect(() => {
        if (!isPlaying) {
            return;
        }

        let isPressingLeft = false;
        let isPressingRight = false;
        let moveIntervalID;

        const updateMovementInterval = () => {
            clearInterval(moveIntervalID);
            dispatchBoardState({
                type: 'move',
                isPressingLeft,
                isPressingRight,
            });
            moveIntervalID = setInterval(() => {
                dispatchBoardState({
                    type: 'move',
                    isPressingLeft,
                    isPressingRight,
                });
            }, 300);
        };

        const handleKeyDown = (event) => {
            if (event.repeat) {
                return;
            }

            if (event.key === 'ArrowDown') {
                setTickSpeed(TickSpeed.Fast);
            }

            if (event.key === 'ArrowUp') {
                dispatchBoardState({
                    type: 'move',
                    isRotating: true,
                });
            }

            if (event.key === 'ArrowLeft') {
                isPressingLeft = true;
                updateMovementInterval();
            }

            if (event.key === 'ArrowRight') {
                isPressingRight = true;
                updateMovementInterval();
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'ArrowDown') {
                setTickSpeed(TickSpeed.Normal);
            }

            if (event.key === 'ArrowLeft') {
                isPressingLeft = false;
                updateMovementInterval();
            }

            if (event.key === 'ArrowRight') {
                isPressingRight = false;
                updateMovementInterval();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            clearInterval(moveIntervalID);
            setTickSpeed(TickSpeed.Normal);
        };
    }, [dispatchBoardState, isPlaying]);

    const renderedBoard = board ? JSON.parse(JSON.stringify(board)) : null;

    if (isPlaying && droppingShape) {
        addShapeToBoard(renderedBoard, droppingBlock, droppingShape, droppingRow, droppingColumn);
    }

    return {
        board: renderedBoard,
        startGame,
        isPlaying,
        score,
        upcomingBlocks
    };
}

function getPoints(numCleared) {
    switch (numCleared) {
        case 0:
            return 0;
        case 1:
            return 100;
        case 2:
            return 300;
        case 3:
            return 500;
        case 4:
            return 800;
        default:
            throw new Error('Unexpected number of rows cleared');
    }
}

function addShapeToBoard(board, droppingBlock, droppingShape, droppingRow, droppingColumn) {
    droppingShape.filter((row) => row.some((isSet) => isSet))
        .forEach((row, rowIndex) => {
            row.forEach((isSet, colIndex) => {
                if (isSet) {
                    board[droppingRow + rowIndex][droppingColumn + colIndex] = droppingBlock;
                }
            });
        });
}