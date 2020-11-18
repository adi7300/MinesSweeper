'use strict'
console.log('Sprint 1. - Adi M.')


//Symbols
const MINE = '💣';
const FLAG = '⛳';
const SMILEY = "img/sNew.png";
const LOSE = "img/sLose.png";
const WIN = "img/sWin.png";
const WHITE_HEART = '🤍';
const RED_HEART = '❤';

//Global variables:
var gGameStarted = false;
var gLevels = [];
var gBoard = [];
var gSelectedLevel;
var gStartTime = 0;
var gElapsedTime = 0;
var gTimerInterval = 0;

var gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 };


function initGame() {
    createLevelList();
    renderLevelScale();
    gSelectedLevel = { size: 4, mines: 2 };
    startGame();

}
function startGame() {
    gGameStarted = false;
    gStartTime = Date.now();
    gElapsedTime = 0;
    gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 };
    document.querySelector(".mines").innerText = gSelectedLevel.mines;
    document.querySelector(".status-smiley").src = SMILEY;
    document.querySelector(".timer").innerText = '00:00'
    gBoard = buildBoard();
    renderBoard();

}

function cellClicked(elCell, i, j) {
    if (!gGameStarted) {
        gStartTime = Date.now() - gElapsedTime;
        gTimerInterval = setInterval(startTimer, 1000);
        setRandomMines(gBoard, i, j);
        setMinesNegs(gBoard);
    }
    gGameStarted = true;
    if (gGame.isOn) {
        if (gBoard[i][j].isMarked)
            return
        if (gBoard[i][j].isMine) {
            renderCell({ i, j }, MINE);
            gGame.isOn = false;
            checkGameOver();
        }
        else if (!gBoard[i][j].isShown) {
            expandShown(elCell, i, j);
            checkGameOver();
        }
        console.log('gGame counter is:', gGame.shownCount);
    }
    else return;
}

function checkGameOver() {
    if ((gGame.shownCount + gGame.markedCount) === gSelectedLevel.size ** 2) {
        stopTimer()
        document.querySelector(".status-smiley").src = WIN;
    }
    else if (!gGame.isOn) {
        stopTimer()
        document.querySelector(".status-smiley").src = LOSE;

    }
}

function expandShown(elCell, i, j) {
    var cellI = i;
    var cellJ = j;
    if (gBoard[i][j].minesArountCount === 0) {
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gSelectedLevel.size) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gSelectedLevel.size) continue;
                gBoard[i][j].isShown = true;
                gGame.shownCount++;
            }
        }
        renderBoard();
    }
    else {
        gBoard[i][j].isShown = true;
        //gGame.shownCount++;
        renderCell({ i, j }, gBoard[i][j].minesArountCount);
    }
}

function setFlag(event, i, j) {
    if (gGame.isOn) {
        if (gBoard[i][j].isShown === true) {
            alert('Cannot flag shown cell');
        }

        // unflag cell
        else if (gBoard[i][j].isMarked) {
            gBoard[i][j].isMarked = false;
            gGame.markedCount--;
            renderCell({ i, j }, '');
        }
        // flag cell
        else {
            gBoard[i][j].isMarked = true;
            gGame.markedCount++;
            renderCell({ i, j }, FLAG);
        }
    }
    event.preventDefault();
    return false;

}

function renderLevelScale() {
    var elLevelTable = document.querySelector(".level-scale");
    var strHtml = ``;
    for (var i = 0; i < 3; i++) {
        strHtml += `<input name="difficulty" type="radio" data-index="${i}" onclick="setDifficulty(${i})" ${i === 0 ? "checked" : ""} ">${gLevels[i].name}`
    }
    elLevelTable.innerHTML = strHtml;

}

function setDifficulty(levelCell) {
    for (var i = 0; i < gLevels.length; i++) {
        // var elLevelRadioButton = document.querySelector(`[data-index="${i}"]`);
        if (i === levelCell) {
            gSelectedLevel.size = gLevels[i].size;
            gSelectedLevel.mines = gLevels[i].mines;
            gLevels[levelCell].isSelected = true;
        }
    }
    stopTimer();
    startGame();
    document.querySelector(".mines").innerText = gSelectedLevel.mines;
    renderBoard();
}

function createLevelList() {
    gLevels.push(createLevel(0, 'Beginner', 4, 2, true));
    gLevels.push(createLevel(1, 'Medium', 8, 12, false));
    gLevels.push(createLevel(2, 'Expert', 12, 30, false));

}

function createLevel(id, name, size, mines, isSelected) {
    return {
        id,
        name,
        size,
        mines,
        isSelected,
    }
}







