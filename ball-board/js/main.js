'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const PASSAGE = 'PASSAGE'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'
const BOMB = 'BOMB'
// const GAMERPURPLE = 'GAMERPURPLE'
const DEADCELL = 'DEADCELL'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/glue.png">'
const BOMB_IMG = '<img src="img/bomb.png">'
// const GAMERPURPLE_IMG = '<img src="img/gamer-purple.png">'

// Model:
var gBoard
var gGamerPos
var gSpawnBallInt
var gPlayerScore
var gBallCount
var gBallsNearby
var gSpawnGlueInt
var gIsFrozen
var gSpawnBombInt
var gIsDead
var gCellsNearby


function onInitGame() {
    if (gSpawnBallInt) clearInterval(gSpawnBallInt)
    if (gSpawnGlueInt) clearInterval(gSpawnGlueInt)
    if (gSpawnBombInt) clearInterval(gSpawnBombInt)
    document.querySelector('.gameover').style.display = 'none'
    gGamerPos = { i: 2, j: 9 }
    gPlayerScore = 0
    gBoard = buildBoard()
    getNearBallsCount()
    // blowUpNegs(gGamerPos)
    renderBoard(gBoard)
    renderGameStats()
    gIsDead = false
    gSpawnBallInt = setInterval(spawnBall, 3000)
    gSpawnGlueInt = setInterval(spawnGlue, 5000)
    gSpawnBombInt = setInterval(spawnBomb, 10000)


}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL
            }
        }
    }
    board[0][5].type = PASSAGE
    board[9][5].type = PASSAGE
    board[5][0].type = PASSAGE
    board[5][11].type = PASSAGE

    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][7].gameElement = BALL
    board[7][3].gameElement = BALL
    gBallCount = 2

    console.log(board)
    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'
            else if (currCell.type === PASSAGE) cellClass += ' passage'
            // else if (currCell.type === DEADCELL) cellClass += ' deadCell'



            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML
    // console.table(gBoard)
}

// Move the player to a specific location
function moveTo(i, j) {
    //TODO: GET NUMBERS
    if (gIsFrozen) return
    if (gIsDead) return

    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    if (j === gBoard[0].length) j = 0
    else if (j === -1) j = gBoard[0].length - 1
    else if (i === gBoard.length) i = 0
    else if (i === -1) i = gBoard.length - 1

    console.log(i, j)
    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) ||
        (jAbsDiff === gBoard[0].length - 1) || (iAbsDiff === gBoard.length - 1)) {
        if (targetCell.gameElement === BALL) {
            gPlayerScore++
            gBallCount--
            PlaySound()
        }
        else if (targetCell.gameElement === GLUE) {
            console.log('oops')
            gIsFrozen = true
            setTimeout(() => {
                gIsFrozen = false
            }, 3000)
        }
        else if (targetCell.gameElement === BOMB) {
            console.log('booom')
            gIsDead = true
            blowUpNegs(gGamerPos)
            GameOver()
        }

        // DONE: Move the gamer
        // REMOVING FROM
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')

        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)

    }
    getNearBallsCount()
    renderGameStats()
    if (gBallCount === 0) GameOver()
    // blowUpNegs()
    // renderColorCell()
}


// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value

}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    console.log('event.key:', event.key)

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function spawnBall() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].type === FLOOR && gBoard[i][j].gameElement === null) {
                emptyCells.push({ i, j })
            }
        }
    }
    if (emptyCells.length === 0) GameOver()

    var randCell = emptyCells[getRandomInt(0, emptyCells.length)]

    //UPDATE MODEL & DOM
    gBallCount += 1
    gBoard[randCell.i][randCell.j].gameElement = BALL
    renderCell(randCell, BALL_IMG)
    getNearBallsCount()
    renderGameStats()
}

function renderGameStats() {
    var elScore = document.querySelector('.score')
    elScore.innerText = gPlayerScore
    var elNearBalls = document.querySelector('.nearballs')
    elNearBalls.innerText = gBallsNearby
}

function GameOver(outcome) {
    clearInterval(gSpawnBallInt)
    clearInterval(gSpawnGlueInt)
    clearInterval(gSpawnBombInt)
    var elGameOver = document.querySelector('.gameover')
    elGameOver.style.display = "inline-block"
}

function PlaySound() {
    var popSound = new Audio('audio/pop.wav')
    popSound.play()
}

function getNearBallsCount() {
    var ballCount = 0

    for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue

            if (gBoard[i][j].gameElement === BALL) ballCount++
        }
    }
    gBallsNearby = ballCount
}


function spawnGlue() {
    var clearGlue
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].type === FLOOR && gBoard[i][j].gameElement === null) {
                emptyCells.push({ i, j })
            }
        }
    }
    if (emptyCells.length === 0) GameOver()

    var randCell = emptyCells[getRandomInt(0, emptyCells.length)]

    //UPDATE MODEL & DOM
    gBoard[randCell.i][randCell.j].gameElement = GLUE
    renderCell(randCell, GLUE_IMG)
    renderGameStats()

    clearGlue = setTimeout(() => {
        if (gBoard[randCell.i][randCell.j].gameElement === GAMER) {
            clearTimeout(clearGlue)
            return
        }
        gBoard[randCell.i][randCell.j].gameElement = null
        renderCell(randCell, '')
        clearTimeout(clearGlue)


    }, 3000)
}


function spawnBomb() {
    var clearBomb
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].type === FLOOR && gBoard[i][j].gameElement === null) {
                emptyCells.push({ i, j })
            }
        }
    }
    if (emptyCells.length === 0) GameOver()

    var randCell = emptyCells[getRandomInt(0, emptyCells.length)]

    //UPDATE MODEL & DOM
    gBoard[randCell.i][randCell.j].gameElement = BOMB
    renderCell(randCell, BOMB_IMG)

    clearBomb = setTimeout(() => {
        if (gBoard[randCell.i][randCell.j].gameElement === GAMER) {
            clearTimeout(clearBomb)
            GameOver()
            return
        }
        gBoard[randCell.i][randCell.j].gameElement = null
        renderCell(randCell, '')
        clearTimeout(clearBomb)
    }, 5000)

}


function blowUpNegs(gGamerPos) {

    for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue

            renderColorCell(gGamerPos, value)
            const elCell = document.querySelector('.cell')
            elCell.innerHTML = value

        }
    }

}

function renderColorCell(gGamerPos, value) {
    const elCell = document.querySelector('.cell')
    elCell.innerHTML = value
    //     elCell = value
    //     return elCell
    // }
}

// function renderColorCell() {
// document.getElementsByClassName('nearBalls')[0].style.color = 'red'
// }