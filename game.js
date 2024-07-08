const gameContainer = document.getElementById('game-container');
const gameBoard = document.getElementById('game-board');
const scoreContainer = document.getElementById('score');

const size = 4;
let board = [];
let score = 0;
let history = [];

function initBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            board[i][j] = 0;
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.value = 0;
            gameBoard.appendChild(tile);
        }
    }
    addRandomTile(true);
    addRandomTile(true);
    updateBoard();
    saveState();
}

function addRandomTile(isNew = false) {
    let emptyTiles = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 0) {
                emptyTiles.push({ x: i, y: j });
            }
        }
    }
    if (emptyTiles.length > 0) {
        const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[x][y] = Math.random() < 0.9 ? 2 : 4;
        if (isNew) {
            const tiles = document.querySelectorAll('.tile');
            tiles[x * size + y].classList.add('new-tile');
        }
    }
}

function updateBoard() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((tile, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        tile.dataset.value = board[row][col];
        tile.textContent = board[row][col] === 0 ? '' : board[row][col];
        tile.classList.remove('new-tile', 'merge', 'move-left', 'move-right', 'move-up', 'move-down');
    });
    scoreContainer.textContent = score;
}

function slide(row) {
    let arr = row.filter(val => val);
    let missing = size - arr.length;
    let zeros = Array(missing).fill(0);
    arr = arr.concat(zeros);
    return arr;
}

function combine(row) {
    for (let i = 0; i < size - 1; i++) {
        if (row[i] === row[i + 1] && row[i] !== 0) {
            row[i] *= 2;
            row[i + 1] = 0;
            score += row[i];
            const tiles = document.querySelectorAll('.tile');
            tiles[i].classList.add('merge');
        }
    }
    return row;
}

function slideAndCombine(row, direction) {
    let oldRow = [...row];
    row = slide(row);
    row = combine(row);
    row = slide(row);
    for (let i = 0; i < size; i++) {
        if (oldRow[i] !== row[i]) {
            const tiles = document.querySelectorAll('.tile');
            tiles[i].classList.add(`move-${direction}`);
        }
    }
    return row;
}

function handleMove(key) {
    saveState();
    let oldBoard = JSON.parse(JSON.stringify(board));
    if (key === 'ArrowLeft') {
        for (let i = 0; i < size; i++) {
            board[i] = slideAndCombine(board[i], 'left');
        }
    } else if (key === 'ArrowRight') {
        for (let i = 0; i < size; i++) {
            board[i] = slideAndCombine(board[i].reverse(), 'right').reverse();
        }
    } else if (key === 'ArrowUp') {
        for (let i = 0; i < size; i++) {
            let col = [board[0][i], board[1][i], board[2][i], board[3][i]];
            col = slideAndCombine(col, 'up');
            for (let j = 0; j < size; j++) {
                board[j][i] = col[j];
            }
        }
    } else if (key === 'ArrowDown') {
        for (let i = 0; i < size; i++) {
            let col = [board[0][i], board[1][i], board[2][i], board[3][i]];
            col = slideAndCombine(col.reverse(), 'down').reverse();
            for (let j = 0; j < size; j++) {
                board[j][i] = col[j];
            }
        }
    }
    if (JSON.stringify(oldBoard) !== JSON.stringify(board)) {
        addRandomTile(true);
        updateBoard();
    }
    checkGameOver();
}

function checkGameOver() {
    let movesAvailable = false;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 0 ||
                (i < size - 1 && board[i][j] === board[i + 1][j]) ||
                (j < size - 1 && board[i][j] === board[i][j + 1])) {
                movesAvailable = true;
            }
        }
    }
    if (!movesAvailable) {
        showGameOver();
    }
}

function showGameOver() {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.id = 'game-over';
    gameOverDiv.innerHTML = `
        <h2>Game Over!</h2>
        <p>Your score: ${score}</p>
        <button id="remove-tile">Remove one tile</button>
        <button id="undo-last">Undo last move</button>
        <button id="undo-three">Undo last 3 moves</button>
    `;
    gameContainer.appendChild(gameOverDiv);
    document.getElementById('remove-tile').addEventListener('click', removeTile);
    document.getElementById('undo-last').addEventListener('click', () => undoMoves(1));
    document.getElementById('undo-three').addEventListener('click', () => undoMoves(3));
}

function removeTile() {
    let maxVal = Math.max(...board.flat());
    for (let i = size - 1; i >= 0; i--) {
        for (let j = size - 1; j >= 0; j--) {
            if (board[i][j] === maxVal) {
                board[i][j] = 0;
                updateBoard();
                hideGameOver();
                return;
            }
        }
    }
}

function undoMoves(count) {
    if (history.length >= count) {
        for (let i = 0; i < count; i++) {
            board = history.pop();
        }
        updateBoard();
        hideGameOver();
    }
}

function saveState() {
    history.push(JSON.parse(JSON.stringify(board)));
}

function hideGameOver() {
    const gameOverDiv = document.getElementById('game-over');
    if (gameOverDiv) {
        gameOverDiv.classList.remove('show');
        setTimeout(() => gameOverDiv.remove(), 500);
    }
}

function setupHammer() {
    const hammer = new Hammer(document.body);
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    hammer.on('swipeleft', () => handleMove('ArrowLeft'));
    hammer.on('swiperight', () => handleMove('ArrowRight'));
    hammer.on('swipeup', () => handleMove('ArrowUp'));
    hammer.on('swipedown', () => handleMove('ArrowDown'));
}

window.addEventListener('keydown', (event) => {
    handleMove(event.key);
});

setupHammer();
initBoard();
