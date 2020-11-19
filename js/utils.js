//var inside = el.getAttribute(‘data-inside’); var data = el.dataset;
'use strict'

function buildBoard() {
    var board = [];
    //build a empty board
    for (var i = 0; i < gSelectedLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gSelectedLevel.size; j++) {
            board[i][j] = {
                minesArountCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            };
        }
    }
    return board;
}

function setRandomMines(board, i, j) {
    var iFirstHit = i;
    var jFirstHit = j;
    var boardSize = gSelectedLevel.size;
    for (var k = 0; k < gSelectedLevel.mines; k++) {
        var i = getRandomInteger(0, boardSize - 1);
        var j = getRandomInteger(0, boardSize - 1);
        while (board[i][j].isMine === true || (i === iFirstHit && j === jFirstHit)) {
            i = getRandomInteger(1, boardSize - 1);
            j = getRandomInteger(1, boardSize - 1);
        }
        board[i][j].isMine = true;
    }
}

function setMinesNegs(board) {
    for (var i = 0; i < gSelectedLevel.size; i++) {
        for (var j = 0; j < gSelectedLevel.size; j++) {
            board[i][j].minesArountCount = countNeighbors(i, j, board);
        }
    }
    renderBoard();
}


function renderBoard() {
    var cellDisplay = ' ';
    var strHtml = `<table><tbody>`;
    for (var i = 0; i < gSelectedLevel.size; i++) {
        strHtml += ' <tr>';
        for (var j = 0; j < gSelectedLevel.size; j++) {
            cellDisplay = ' ';
            if (gBoard[i][j].isShown) {
                if (gBoard[i][j].isMine) {
                    cellDisplay = MINE;
                }
                else if (gBoard[i][j].minesArountCount) {
                    cellDisplay = gBoard[i][j].minesArountCount;
                }
                else cellDisplay = ' ';
            }
            if (gBoard[i][j].isMarked) cellDisplay = FLAG;

            strHtml += ` <td data-id="${i}-${j}" class="cell num${gBoard[i][j].minesArountCount} ${gBoard[i][j].isShown ? 'open-cell' : 'close-cell'}"  onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="setFlag(event,${i},${j})">${cellDisplay}</td>`;
        }
        strHtml += ' </tr>';

    }
    strHtml += '</tbody></table>';
    document.querySelector(".board").innerHTML = strHtml;
}

// function renderCell(location, value) {
//     // Select the elCell and set the value
//     var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
//     elCell.innerHTML = value;

// }

function getRandomInteger(min, max) {
    var num = Math.floor(Math.random() * Math.floor(max + 1));
    while (num < min) {
        num = Math.floor(Math.random() * Math.floor(max + 1));
    }
    return num;
}

function countNeighbors(cellI, cellJ, mat) {
    var neighborsSum = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (mat[i][j].isMine === true) neighborsSum++;
        }
    }
    return neighborsSum;
}

function renderCell(pos, value) {
    var elCell = document.querySelector(`[data-id="${pos.i}-${pos.j}"]`);
    if (value !== FLAG) {
        elCell.classList.remove('close-cell');
        elCell.classList.add('open-cell');
    }
    elCell.innerText = value
}
function startTimer() {
    var elTimer = document.querySelector(".timer");
    gElapsedTime = Date.now() - gStartTime;
    elTimer.innerText = `${timeToString(gElapsedTime)}`;
}

function timeToString(time) {
    let diffInHrs = time / 3600000;
    let hh = Math.floor(diffInHrs);

    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);

    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);

    let formattedMM = mm.toString().padStart(2, "0");
    let formattedSS = ss.toString().padStart(2, "0");

    return `${formattedMM}:${formattedSS}`;
}

function stopTimer() {
    console.log('Counter stops');
    if (!gGame.isOn)
        clearInterval(gTimerInterval);
}