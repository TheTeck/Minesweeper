// Object holding the options for board sizes and bomb count
const boardData = {
    test: {
        x: 5, 
        y: 5, 
        bombs: 5
    },
    easy: {
        x: 10,
        y: 10,
        bombs: 10
    },
    medium: {
        x: 16,
        y: 16,
        bombs: 40
    },
    hard: {
        x: 30,
        y: 16,
        bombs: 99
    }
}

// Class to make each of the cells that make up board
class Cell {
    static flaggedCount = 0;
    static exposedCount = 0;

    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.value = 0;
        this.exposed = false;
        this.flagged = false;
    }

    flag() {
        if(this.flagged) {
            this.flagged = false;
            Cell.flaggedCount--;
        } else {
            this.flagged = true;
            Cell.flaggedCount++;
        }
    }

    expose() {
        this.exposed = true;
        Cell.exposedCount++;
    }
}



// All the game's state variables
let board
let skillLevel
let isGameOver
let timer

// Caching all interactive HTML elements
const boardEl = document.getElementById('board')
const restartEl = document.getElementById('restart')
const flagEl = document.getElementById('flags')
const timerEl = document.getElementById('timer')
const skillEl = document.getElementById('skill')
const msgEl = document.getElementById('msg')

// Setup event listeners
skillEl.addEventListener('click', init)
restartEl.addEventListener('click', init)
boardEl.addEventListener('click', handleBoardClick)
boardEl.addEventListener('contextmenu', handleFlagClick)

// Start the game
init()

// Sets up a new game
function init() {
    skillLevel = 'test'
    isGameOver = false
    time = 0
    board = []

    // Generate 2D array of skillLevel dimensions of Cell instances 
    for (let i = 0; i < boardData[skillLevel].y; i++) {
        const row = new Array()
        for (let j = 0; j < boardData[skillLevel].x; j++) {
            const aCell = new Cell(j,i)
            row.push(aCell)
        }
        board.push(row)
    }

    // Randomly give cells bombs (if they don't have it already)
    let bombCount = boardData[skillLevel].bombs
    while (bombCount) {
        const randX = Math.floor(Math.random() * boardData[skillLevel].x)
        const randY = Math.floor(Math.random() * boardData[skillLevel].y)

        if (board[randY][randX].value === 0) {
            board[randY][randX].value = 9
            bombCount--
        }
    }

    // Populate the cells with numerical values indicating how many bombs are next to it
    // Each surrounding space also gets out-of-bounds checking
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j].value !== 9) {
                if (j > 0 && i > 0 && board[i-1][j-1].value === 9)
                    board[i][j].value++
                if(i > 0 && board[i-1][j].value === 9)
                    board[i][j].value++
                if (i > 0 && j < board[0].length-1 && board[i-1][j+1].value === 9)
                    board[i][j].value++
                if(j > 0 && board[i][j-1].value === 9)
                    board[i][j].value++
                if(j < board[0].length-1 && board[i][j+1].value === 9)
                    board[i][j].value++
                if (j > 0 && i < board.length-1 && board[i+1][j-1].value === 9)
                    board[i][j].value++
                if(i < board.length-1 && board[i+1][j].value === 9)
                    board[i][j].value++
                if (j < board[0].length-1 && i < board.length-1 && board[i+1][j+1].value === 9)
                    board[i][j].value++
            }
        }
    }
}

// Renders the elements on the screen
function render() {
    // to be coded
}

// Handler for left mouse clicks on board
function handleBoardClick(e) {
    // to be coded
}

// Handler for right mouse clicks on board
function handleFlagClick(e) {
    // to be coded
}

// Recursive function to expose spaces that are empty
function expandExposure(space) {
    // to be coded
}

