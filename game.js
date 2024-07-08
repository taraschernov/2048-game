Telegram.WebApp.ready();

const gameContainer = document.getElementById('game-container');
const gameBoard = document.getElementById('game-board');

const size = 4;
let board = [];
let score = 0;

function initBoard() {
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
    addRandomTile();
    addRandomTile();
    updateBoard();
}

function addRandomTile() {
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
    }
}

function updateBoard() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((tile, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        tile.dataset.value = board[row][col];
        tile.textContent = board[row][col] === 0 ? '' : board[row][col];
    });
}

function slide(row) {
    let arr = row.filter(val => val);
    let missing = size - arr.length;
    let zeros = Array(missing).fill(0);
    arr = zeros.concat(arr);
    return arr;
}

function combine(row) {
    for (let i = size - 1; i >= 1; i--) {
        if (row[i] === row[i - 1] && row[i] !== 0) {
            row[i] *= 2;
            row[i - 1] = 0;
            score += row[i];
        }
    }
    return row;
}

function slideAndCombine(row) {
    row = slide(row);
    row = combine(row);
    row = slide(row);
    return row;
}

function handleMove(key) {
    let oldBoard = JSON.parse(JSON.stringify(board));
    if (key === 'ArrowLeft') {
        for (let i = 0; i < size; i++) {
            board[i] = slideAndCombine(board[i]);
        }
    } else if (key === 'ArrowRight') {
        for (let i = 0; i < size; i++) {
            board[i] = slideAndCombine(board[i].reverse()).reverse();
        }
    } else if (key === 'ArrowUp') {
        for (let i = 0; i < size; i++) {
            let col = [board[0][i], board[1][i], board[2][i], board[3][i]];
            col = slideAndCombine(col);
            for (let j = 0; j < size; j++) {
                board[j][i] = col[j];
            }
        }
    } else if (key === 'ArrowDown') {
        for (let i = 0; i < size; i++) {
            let col = [board[0][i], board[1][i], board[2][i], board[3][i]];
            col = slideAndCombine(col.reverse()).reverse();
            for (let j = 0; j < size; j++) {
                board[j][i] = col[j];
            }
        }
    }
    if (JSON.stringify(oldBoard) !== JSON.stringify(board)) {
        addRandomTile();
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
        alert('Game Over!');
    }
}

window.addEventListener('keydown', (event) => {
    handleMove(event.key);
});

initBoard();
