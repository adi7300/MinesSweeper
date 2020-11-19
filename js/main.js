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
var maxBeginnerScore = 0;
var maxMediumScore = 0;
var maxExpertScore = 0;

var gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 };


function initGame() {
    createLevelList();
    setLevelScale();
    gLivesCounter = 1;
    gHintsCounter = 1
    gSelectedLevel = { size: 4, mines: 2, lives: 1, name: 'Beginner' };
    startGame();

}
function startGame() {
    gGameStarted = false;
    gStartTime = Date.now();
    gHintOn = false;
    gElapsedTime = 0;
    gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 };

    document.querySelector(".mines").innerText = gSelectedLevel.mines;

    document.querySelector(".status-smiley").src = SMILEY;
    document.querySelector(".timer").innerText = '00:00'
    gBoard = buildBoard();
    renderBoard();
    renderHeartsHints();
    showWinnerList();
}

function renderScoreTimer() {

    document.querySelector(".mines").innerText = `${gSelectedLevel.mines - gGame.markedCount}</div></div>`;
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
            gHintsCounter--;
            renderHeartsHints();
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
                setTimeout(checkGameOver, 1000);
            }
            else if (!gBoard[i][j].isShown) {
                expandShown(elCell, i, j);
                setTimeout(checkGameOver, 1000);
            }
        }
    }
    else return;
}

function expandShown(elCell, i, j) {
    var cellI = i;
    var cellJ = j;
    if (gBoard[i][j].minesArountCount === 0) {
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gSelectedLevel.size) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gSelectedLevel.size) continue;
                if (!gBoard[i][j].isMarked) {
                    if (!gBoard[i][j].isShown) {
                        gGame.shownCount++;
                    }
                    gBoard[i][j].isShown = true;
                    // expandShown(elCell, i, j);
                }
            }
        }
    }
    else {
        gBoard[i][j].isShown = true;
        gGame.shownCount++;
        renderCell({ i, j }, gBoard[i][j].minesArountCount);
        return false;

    }
    renderBoard();
}


function selfClicked() {
    var nonMinesColseCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if ((!gBoard[i][j].isMine) && (!gBoard[i][j].isShown))
                nonMinesColseCells.push({ i, j });
        }
    }
    var safeCell = getRandomInteger(1, nonMinesColseCells.length - 1);

    var elSafeCell = document.querySelector(`[data-id="${nonMinesColseCells[safeCell].i}-${nonMinesColseCells[safeCell].j}"]`);
    console.log(elSafeCell);
    elSafeCell.classList.add("safe-cell");
    renderBoard();
    ///to be continue...

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
            document.querySelector(".mines").innerText = `${gSelectedLevel.mines - gGame.markedCount}`;
            renderBoard();
        }
        // flag cell
        else {
            gBoard[i][j].isMarked = true;
            gGame.markedCount++;
            document.querySelector(".mines").innerText = `${gSelectedLevel.mines - gGame.markedCount}`;
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
            gSelectedLevel.name = gLevels[i].name;

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
                    //  document.querySelector(`[data-id="${i}-${j}"]`).classList.add('hinted');
                    gShowHints.push({ i, j });
                    gBoard[i][j].isShown = true;
                }
            }
        }
    }
    renderBoard();
    setTimeout(closeHint, 1000);

}

function closeHint() {
    for (var i = 0; i < gShowHints.length; i++) {
        gBoard[gShowHints[i].i][gShowHints[i].j].isShown = false;
    }
    renderBoard();
    gHintOn = false;

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


function checkGameOver() {
    console.log('checkGameOver called');
    if ((gGame.shownCount + gSelectedLevel.mines) === gSelectedLevel.size ** 2) {
        gGame.isOn = false
        var userTime = timeToString(gElapsedTime);
        userTime = userTime.replace(2, '.');
        gGame.secsPassed = parseFloat(userTime);
        stopTimer();
        document.querySelector(".status-smiley").src = WIN;
        updateWinnersList(userTime);
    }
    else if (!gGame.isOn) {
        stopTimer();
        document.querySelector(".status-smiley").src = LOSE;

    }
}

function updateWinnersList(userScore) {
    if (typeof (Storage) !== 'undefined') {
        var level = gSelectedLevel.name.toLowerCase();
        var levelValue = localStorage.getItem(level);
        if (levelValue) {
            var localUser = levelValue.split('^');
            if (userScore < localUser[1]) {
                var userName = prompt('You got the best score! please enter your name:');
                localStorage.setItem(level, userName + '^' + userScore);
            }
        }
        else {
            var userName = prompt('You got the best score! please enter your name:');
            localStorage.setItem(level, userName + '^' + userScore);
        }
        if (userName !== 'undefined')
            document.querySelector(`.${level}`).innerText = userName;

    } else {
        alert('Sorry, your browser does not support Web Storage');

    }
}
function showWinnerList() {
    if (typeof (Storage) !== 'undefined') {
        for (var i = 0; i < gLevels.length; i++) {
            var level = gLevels[i].name.toLowerCase();
            var userData = localStorage.getItem(level);
            if (userData !== 'undefined' && userData) {
                var localUser = userData.split('^');
                document.querySelector(`.${level}`).innerText = localUser[0];
            }

        }
    }
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







