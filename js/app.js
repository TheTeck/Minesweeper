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
let mouseX
let mouseY

// Caching all interactive HTML elements
const boardEl = document.getElementById('board')
const mainEl = document.getElementById('main-container')
const containerEl = document.getElementById('board-container')
const restartEl = document.getElementById('restart')
const flagEl = document.getElementById('flag')
const timerEl = document.getElementById('timer')
const skillEl = document.getElementById('skill')
const msgEl = document.getElementById('msg')
const rootEl = document.documentElement
const bodyEl = document.body

// Setup event listeners
skillEl.addEventListener('change', init)
restartEl.addEventListener('mouseup', init)
boardEl.addEventListener('click', handleBoardClick)
boardEl.addEventListener('contextmenu', handleFlagClick)
bodyEl.addEventListener('mousemove', getCoordinates)

// Start the game
init()

///////////////////////////////////////////////////////////////////////////
/////////////        Sets up a new game          /////////////////////////
/////////////////////////////////////////////////////////////////////////
function init() {
    skillLevel = skillEl.value
    isGameOver = false
    time = 0
    board = []
    mouseX = -1
    mouseY = -1
    Cell.exposedCount = 0
    Cell.flaggedCount = 0

    if (timer)
        clearInterval(timer)
    timer = undefined

    while (boardEl.hasChildNodes()) {
        boardEl.removeChild(boardEl.lastChild)
    }

    // Randomly change color and graphical theme for game
    randomTheme()

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

            // Remove any flashing from restart button and win/lose message
            restartEl.classList.remove('indicate')
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

        restartEl.classList.add('indicate')
        msgEl.style.visibility = 'visible'
        if (boardData[skillLevel].x * boardData[skillLevel].y - boardData[skillLevel].bombs <= Cell.exposedCount) {
            msgEl.innerText = 'You Won!'
        } else {
            msgEl.innerText = 'You Lost!'
        }
        msgEl.style.top = `${(window.innerHeight + mainEl.style.height) / 2}px`

    }

    // Remove the canvas background to start fresh
    if (document.getElementById('canvas')) 
    bodyEl.removeChild(document.getElementById('canvas'))

    // New canvas for background
    const backgroundCanvas = document.createElement('div')
    backgroundCanvas.classList.add('horizonGradient')
    backgroundCanvas.setAttribute('id', 'canvas')

    // X and Y position for center of radial-gradient background
    let bgCenterX = (window.innerWidth / 2) - (mouseX - (window.innerWidth / 2))
    let bgCenterY = (window.innerHeight / 2) - (mouseY - (window.innerHeight / 2))
    
    // Make the radial-gradient effect on canvas background
    if (mouseX === -1) {
        // Default shadow effect
        backgroundCanvas.style.background = `radial-gradient(at center, var(--bg-color) 0%, var(--main-color) 70%)`
    } else {
        // Shadow effect once mouse is over window
        backgroundCanvas.style.background = `radial-gradient(at ${bgCenterX}px ${bgCenterY}px, var(--bg-color) 0%, var(--main-color) 70%)`
    }
   
    // Make the shadow for the gameboard
    const boardShadow = document.createElement('div')
    boardShadow.classList.add('boardShadow')
    boardShadow.style.height = `${(boardData[skillLevel].y * 25 + 60) * 1.2}px`
    boardShadow.style.width = `${(boardData[skillLevel].x * 25 + 20) * 1.2}px`

    if (mouseX === -1) {
        // Default shadow effect
        boardShadow.style.top = `${(window.innerHeight / 2) - ((boardData[skillLevel].y * 25 + 60) * 0.6)}px`
        boardShadow.style.left = `${(window.innerWidth / 2) - ((boardData[skillLevel].x * 25 + 20) * 0.6)}px`
    } else {
        // Shadow effect once mouse is over window
        boardShadow.style.top = `${(window.innerHeight / 2) - (mouseY - (window.innerHeight / 2) / 2)}px`
        boardShadow.style.left = `${(window.innerWidth / 2) - ((boardData[skillLevel].x * 25 + 20) * 0.6) - (mouseX - (window.innerWidth / 2))}px` 
    }

    backgroundCanvas.appendChild(boardShadow)
    bodyEl.appendChild(backgroundCanvas)
}

///////////////////////////////////////////////////////////////////////////
///////////        Handles mouse movement in window        ///////////////
/////////////////////////////////////////////////////////////////////////
function getCoordinates(e) {
    mouseX = e.clientX
    mouseY = e.clientY
    render()
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


///////////////////////////////////////////////////////////////////////////
///////////        Randomly changes color and theme        ///////////////
/////////////////////////////////////////////////////////////////////////
function randomTheme() {
    const numberOfThemes = 11
    const chosenTheme = Math.floor(Math.random() * numberOfThemes)

                        // Black and white
    const themes = [ ['black', 'whitesmoke', 'rgb(172, 170, 170)'], 
                        // Blue and algae green            
                     ['rgb(7, 8, 36)', 'rgb(109, 188, 120)', 'rgb(43, 0, 254'],
                        // Ironman (red and gold)
                     ['rgb(0, 0, 0)', 'rgb(220, 188, 109)', 'rgb(254, 0, 43)'],
                        // Blue and green
                     ['#2B1412', '#39C644', '#4439C6'],
                        // Charcoal and tan
                      ['rgb(16, 38, 32)', 'rgb(246, 234, 210)', 'rgb(186, 140, 72)'],
                        // Icy blues
                      ['#05445E', '#D4F1F4', '#189AB4'],
                        // Mint and mauve
                      ['#3D5B59', '#B5E5CF', '#B99095'],
                        // Purples
                      ['#211522', '#D3B1C2', '#613659'],
                        // Desert
                      ['#1E2640', '#F3EAC0', '#DC9750'],
                        // Chocolate
                      ['#202427', '#AE8B70', '#4F0000'],
                        // Spring
                      ['#142D3D', '#C6C152', '#C6529A']]


    // Apply color scheme to CSS
    rootEl.style.setProperty('--main-color', themes[chosenTheme][0])
    rootEl.style.setProperty('--bg-color', themes[chosenTheme][1])
    rootEl.style.setProperty('--bg-color-dark', themes[chosenTheme][2])
}