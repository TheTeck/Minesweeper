// Object holding the options for board sizes and bomb count
const boardData = {
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
        if (!this.exposed) {
            this.exposed = true;
            Cell.exposedCount++;
        }
    }
}

// All the game's state variables
let board
let skillLevel
let isGameOver
let time
let timer

// Caching all interactive HTML elements
const boardEl = document.getElementById('board')
const mainEl = document.getElementById('main-container')
const containerEl = document.getElementById('board-container')
const restartEl = document.getElementById('restart')
const flagEl = document.getElementById('flag')
const timerEl = document.getElementById('timer')
const skillEl = document.getElementById('skill')
const msgEl = document.getElementById('msg')

// Setup event listeners
skillEl.addEventListener('click', init)
restartEl.addEventListener('click', init)
boardEl.addEventListener('click', handleBoardClick)
boardEl.addEventListener('contextmenu', handleFlagClick, false)

// Start the game
init()

///////////////////////////////////////////////////////////////////////////
/////////////        Sets up a new game          /////////////////////////
/////////////////////////////////////////////////////////////////////////
function init() {
    console.log('init() called', skillEl.value)
    skillLevel = skillEl.value
    isGameOver = false
    time = 0
    timer = undefined
    board = []
    Cell.exposedCount = 0
    Cell.flaggedCount = 0

    while (boardEl.hasChildNodes()) {
        boardEl.removeChild(boardEl.lastChild)
    }

    console.log(skillLevel)
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

    // Populate the cells with numerical values indicating how many bombs are next to it (9=bomb)
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

    // Display it in the browser
    render()
}

///////////////////////////////////////////////////////////////////////////
/////////////     Renders the elements in the browser      ///////////////
/////////////////////////////////////////////////////////////////////////
function render() {
    if (!isGameOver) {
        // First creation of board
        if (!boardEl.hasChildNodes()) {
            // Resize all containers to hold current skill level board
            mainEl.style.width = `${boardData[skillLevel].x * 25 + 20}px`
            mainEl.style.height = `${boardData[skillLevel].y * 25 + 60}px`
            boardEl.style.width = `${boardData[skillLevel].x * 25}px`
            boardEl.style.height = `${boardData[skillLevel].y * 25}px`
            containerEl.style.width = `${boardData[skillLevel].x * 25 + 20}px`
            containerEl.style.height = `${boardData[skillLevel].y * 25 + 20}px`
            
            for (let y = 0; y < board.length; y++) {
                let newRow = document.createElement('div')
                newRow.classList.add('row')

                for (let x = 0; x < board[0].length; x++) {
                    let newCell = document.createElement('div')
                    newCell.setAttribute('id', `${x},${y}`)
                    newCell.classList.add('space')
                    newRow.appendChild(newCell)
                }
                boardEl.appendChild(newRow)
            }

            msgEl.style.visibility = 'hidden'
        }

        // Update the clock element
        let outTime = '' + time
        while (outTime.length < 3)
            outTime = '0' + outTime

        timerEl.innerText = outTime

        // Update the flag element
        let flags =  '' + (boardData[skillLevel].bombs - Cell.flaggedCount)
        if (flags.length < 2)
            flags = '0' + flags
        flagEl.innerText = flags

        // Renders all the cells on the board
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[0].length; x++) {
                const thisCell = document.getElementById(`${x},${y}`)

                if (board[y][x].exposed) {
                    thisCell.className = 'exposed'
                    // Value in cell is 1-8
                    if (board[y][x].value > 0 && board[y][x].value < 9) {
                        thisCell.classList.add('number')
                        thisCell.classList.add(`_${board[y][x].value}`)
                        thisCell.innerText = board[y][x].value
                    }
                } else if (board[y][x].flagged) {
                    if (!thisCell.hasChildNodes())
                        thisCell.innerHTML = '<i class="material-icons">tour</i>'
                } else {
                    thisCell.innerHTML = ''
                }
            }
        }
    } else {
        // Game is over (Show the bombs)
        // Renders all the cells on the board
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[0].length; x++) {
                const thisCell = document.getElementById(`${x},${y}`)
                thisCell.className = 'exposed'
                // Value in cell is 1-8
                if (board[y][x].value > 0 && board[y][x].value < 9) {
                    thisCell.classList.add('number')
                    thisCell.classList.add(`_${board[y][x].value}`)
                    thisCell.innerText = board[y][x].value
                } else if (board[y][x].value === 9) {
                    // Untouched bombs
                        thisCell.innerHTML = '<i class="material-icons">light_mode</i>'
                } else if (board[y][x].value === 19) {
                    // This bomb was detonated
                    thisCell.style.backgroundColor = 'black'
                    thisCell.innerHTML = '<i class="material-icons _3">light_mode</i>'
                } else {
                    thisCell.innerHTML = ''
                }
                if (board[y][x].flagged && board[y][x].value !== 9)
                    thisCell.style.backgroundColor = 'red'
            }
        }

        msgEl.style.visibility = 'visible'
        if (boardData[skillLevel].x * boardData[skillLevel].y - boardData[skillLevel].bombs <= Cell.exposedCount) {
            msgEl.innerText = 'You Won!'
        } else {
            msgEl.innerText = 'You Lost!'
        }

    }
}

///////////////////////////////////////////////////////////////////////////
///////////     Handles the left mouse clicks on board     ///////////////
/////////////////////////////////////////////////////////////////////////
function handleBoardClick(e) {
    if (!isGameOver) {
        if (!timer) {
            timer = setInterval(function() {
                time++
                render()
            }, 1000)
        }
        const coordinates = e.target.id.split(',')
        const clickedCell = board[coordinates[1]][coordinates[0]]

        // If target cell is a bomb
        if (clickedCell.value === 9) {
            isGameOver = true
            clearInterval(timer)
            // marked as hitted
            clickedCell.value = 19 
        } else {
            clickedCell.expose()

            if (clickedCell.value === 0) 
                expandExposure(clickedCell)

            if (boardData[skillLevel].x * boardData[skillLevel].y - boardData[skillLevel].bombs === Cell.exposedCount) {
                isGameOver = true
                clearInterval(timer)
            }
        }
    }
    render()
}

///////////////////////////////////////////////////////////////////////////
///////////    Handles the right mouse clicks on board     ///////////////
/////////////////////////////////////////////////////////////////////////
function handleFlagClick(e) {
    e.preventDefault()
    let coordinates

    // If space has a flag, ignore the icon and get parent div info
    if (e.target.className === 'material-icons') {
        const parentCell = e.target.parentNode
        coordinates = parentCell.id.split(',')
    } else {
        coordinates = e.target.id.split(',')
    }

    const flaggedCell = board[coordinates[1]][coordinates[0]]
    if (!flaggedCell.exposed) {
        if (flaggedCell.flagged)
            flaggedCell.flag()
        else if (boardData[skillLevel].bombs - Cell.flaggedCount > 0) {
            flaggedCell.flag()
        }
        render()
    }
}

///////////////////////////////////////////////////////////////////////////
///////////         Exposes contiguous empty cells         ///////////////
/////////////////////////////////////////////////////////////////////////
function expandExposure(cell) {
    const x = cell.x
    const y = cell.y

    if (x > 0 && y > 0 && !board[y-1][x-1].exposed && !board[y-1][x-1].flagged) {
        board[y-1][x-1].expose()
        if (board[y-1][x-1].value === 0)
            expandExposure(board[y-1][x-1])
    }
    if(y > 0 && !board[y-1][x].exposed && !board[y-1][x].flagged) {
        board[y-1][x].expose()
        if (board[y-1][x].value === 0)
            expandExposure(board[y-1][x])
    }
    if (y > 0 && x < board[0].length-1  && !board[y-1][x+1].exposed && !board[y-1][x+1].flagged) {
        board[y-1][x+1].expose()
        if (board[y-1][x+1].value === 0)
            expandExposure(board[y-1][x+1])
    }
    if(x > 0 && !board[y][x-1].exposed && !board[y][x-1].flagged) {
        board[y][x-1].expose()
        if (board[y][x-1].value === 0)
            expandExposure(board[y][x-1])
    }
    if(x < board[0].length-1 && !board[y][x+1].exposed && !board[y][x+1].flagged) {
        board[y][x+1].expose()
        if (board[y][x+1].value === 0)
            expandExposure(board[y][x+1])
    }
    if (x > 0 && y < board.length-1 && !board[y+1][x-1].exposed && !board[y+1][x-1].flagged) {
        board[y+1][x-1].expose()
        if (board[y+1][x-1].value === 0)
            expandExposure(board[y+1][x-1])
    }
    if(y < board.length-1 && !board[y+1][x].exposed && !board[y+1][x].flagged) {
        board[y+1][x].expose()
        if (board[y+1][x].value === 0)
            expandExposure(board[y+1][x])
    }
    if (x < board[0].length-1 && y < board.length-1 && !board[y+1][x+1].exposed && !board[y+1][x+1].flagged) {
        board[y+1][x+1].expose()
        if (board[y+1][x+1].value === 0)
            expandExposure(board[y+1][x+1])
    }
}

