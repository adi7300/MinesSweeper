'use strict'
console.log('Sprint 1. - Adi M.')


//const Symbols
const MINE = '💣';
const FLAG = '⛳';
const SMILEY = "img/sNew.png";
const LOSE = "img/sLose.png";
const WIN = "img/sWin.png";
const WHITE_HEART = "img/emptyHeart.png";
const RED_HEART = "img/fullHeart.png";
const EMPTY_LAMP = "img/emptyLamp.png"
const FULL_LAMP = "img/fullLamp.png"

//Global variables:
var gGameStarted = false;
var gLevels = [];
var gBoard = [];
var gSelectedLevel;
var gStartTime = 0;
var gElapsedTime = 0;
var gTimerInterval = 0;
var gLivesCounter = 1;
var gHintsCounter = 1;
var gShowHints = [];
var gHintOn = false;

var gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 };


function initGame() {
    createLevelList();
    setLevelScale();
    gLivesCounter = 1;
    gHintsCounter = 1
    gSelectedLevel = { size: 4, mines: 2, lives: 1 };
    startGame();

}
function startGame() {
    gGameStarted = false;
    gStartTime = Date.now();
    gHintOn = false;
    gElapsedTime = 0;
    gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 };
    renderScoreTimer();
    document.querySelector(".mines").innerText = gSelectedLevel.mines;
    document.querySelector(".status-smiley").src = SMILEY;
    document.querySelector(".timer").innerText = '00:00'
    gBoard = buildBoard();
    renderBoard();
    renderHeartsHints();

}

function renderScoreTimer() {

    document.querySelector(".score-time").innerHTML = '<div><h3>Mines</h3><div class="mines">0</div></div><img class="status-smiley" onclick="initGame()"></img><div><h3>Timer</h3> <div class="timer">00:00</div></div>';
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
        if (gHintOn) {
            giveHint(elCell, i, j);
        }
        else {
            if (gBoard[i][j].isMine) {
                if (gLivesCounter !== 0) {
                    gLivesCounter--;
                    document.querySelector(".lives-modal").style.display = "block";
                    renderHeartsHints();
                    return;
                }
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
    }
    else return;
}

function checkGameOver() {
    console.log('Game over check');
    if ((gGame.shownCount + gGame.markedCount) === gSelectedLevel.size ** 2) {
        stopTimer();
        document.querySelector(".status-smiley").src = WIN;
    }
    else if (!gGame.isOn) {
        stopTimer();
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
                if (!gBoard[i][j].isShown) gGame.shownCount++;
                gBoard[i][j].isShown = true;
            }
        }
        renderBoard();
    }
    else {
        gBoard[i][j].isShown = true;
        gGame.shownCount++;
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
            checkGameOver();
        }
    }
    event.preventDefault();
    return false;

}

function setLevelScale() {
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
            gHintsCounter = gLivesCounter = gSelectedLevel.lives = gLevels[i].lives;
            gLevels[levelCell].isSelected = true;
        }
    }
    stopTimer();
    startGame();
    document.querySelector(".mines").innerText = gSelectedLevel.mines;
    renderBoard();
    renderHeartsHints();
}
function giveHint(elCell, cellI, cellJ) {
    gShowHints = [];
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gSelectedLevel.size) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gSelectedLevel.size) continue;
            {
                if (!gBoard[i][j].isShown) {
                    document.querySelector(`[data-id="${i}-${j}"]`).classList.add('hinted');
                    console.log(gBoard[i][j].isShown);
                    gShowHints.push({ i, j });
                    gBoard[i][j].isShown = true;
                }
            }
        }
    }
    console.log('show arr', gShowHints);
    renderBoard();
    console.log('elCell is:', elCell)
    //elCell.src = "img/emptyLamp.png";
    setTimeout(closeHint, 1000);

}

function closeHint() {
    for (var i = 0; i < gShowHints.length; i++) {
        gBoard[gShowHints[i].i][gShowHints[i].j].isShown = false;
    }
    renderBoard();

}

function getHint(elHint) {
    gHintOn = !gHintOn;
    elHint.classList.toggle("blur");

}

function renderHeartsHints() {
    var elDivHeartsHints = document.querySelector(".hearts-hints");
    var strHtml = '<div class="hearts">';

    for (var i = 0; i < 3 - gLivesCounter; i++) {
        strHtml += '  <img class="heart" src="img/emptyHeart.png"></img>';
    }
    for (i; i < 3; i++) {
        strHtml += ' <img class="heart" src="img/fullHeart.png"></img>';
    }
    strHtml += ' </div><div><div class="hints">'

    for (var i = 0; i < 3 - gHintsCounter; i++) {
        strHtml += '  <img class="hint" src="img/emptyLamp.png"></img>';
    }
    for (i; i < 3; i++) {
        strHtml += ' <img class="hint" onclick="getHint(this)" src="img/fullLamp.png"></img>';
    }
    strHtml + '  </div></div>'
    elDivHeartsHints.innerHTML = strHtml;

}

function createLevelList() {
    gLevels.push(createLevel(0, 'Beginner', 4, 2, 1, true));
    gLevels.push(createLevel(1, 'Medium', 8, 12, 2, false));
    gLevels.push(createLevel(2, 'Expert', 12, 30, 3, false));

}

function createLevel(id, name, size, mines, lives, isSelected) {
    return {
        id,
        name,
        size,
        mines,
        lives,
        isSelected,
    }
}







