// Object holding the options for board sizes and bomb count
// Each property -> [X-Dimension, Y-Dimension, Bomb Count]
const boardData = {
    easy: [10, 10, 10],
    medium: [16, 16, 40],
    hard: [30, 16, 99]
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
    // to be coded
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

