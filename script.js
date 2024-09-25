function moveAction(event) {
    if(event.target.style.backgroundImage == 'url("image/runner.png")' && onTurn == 0 && selected < 0) {
        selected = parseInt(event.target.id.substr(1));
        event.target.style.backgroundColor = "rgb(255, 255, 32)";
        move = movement(logicBoard, selected, 7, [4]);
    }
    else if(event.target.style.backgroundImage == 'url("image/chaser.png")' && onTurn == 1 && selected < 0) {
        selected = parseInt(event.target.id.substr(1));
        event.target.style.backgroundColor = "rgb(255, 255, 32)";
        move = movement(logicBoard, selected, 3, [2, 4]);
    }
    else if(move.findIndex(value => value[1] == parseInt(event.target.id.substr(1))) >= 0 && selected >= 0) {
        if(event.target.style.backgroundImage == 'url("image/portal.png")') {
            let rand;
            let king = document.getElementById("s" + selected).style.backgroundImage;
                let index = logicBoard[selected];
            event.target.style.backgroundImage = "";
            logicBoard[parseInt(event.target.id.substr(1))] = 0;

            if(document.getElementById("s" + selected).style.backgroundImage == 'url("image/runner.png")') {
                logicBoard[selected] = 0;
                document.getElementById("s" + selected).style.backgroundImage = "";

                do {
                    rand = Math.floor(Math.random() * logicBoard.length);
                } while(document.getElementById("s" + rand).style.backgroundImage != "");
                document.getElementById("s" + rand).style.backgroundImage = king;
                logicBoard[rand] = index;
            }
            else {
                event.target.style.backgroundImage = king;
                logicBoard[parseInt(event.target.id.substr(1))] = index;
                logicBoard[selected] = 0;
                document.getElementById("s" + selected).style.backgroundImage = "";
            }

            do {
                rand = Math.floor(Math.random() * logicBoard.length);
            } while(document.getElementById("s" + rand).style.backgroundImage != "");
            document.getElementById("s" + rand).style.backgroundImage = 'url("image/portal.png")';
            logicBoard[rand] = 4;
        }
        else {
            event.target.style.backgroundImage = document.getElementById("s" + selected).style.backgroundImage;
            logicBoard[parseInt(event.target.id.substr(1))] = logicBoard[selected];
            logicBoard[selected] = 0;
            document.getElementById("s" + selected).style.backgroundImage = "";
        }

        document.getElementById("s" + selected).style.backgroundColor = "";
        selected = -1;
        onTurn = Math.abs(onTurn - 1);
    }
}

function createBoard(container) {
    let board = document.createElement("div");
    board.id = "board";

    for(let i = 0; i < 10; i++) {
        for(let j = 0; j < 10; j++) {
            let square;
            if(i % 9 == 0 && j % 9 == 0) square = document.createElement("div");
            else if(i % 9 == 0) {
                square = document.createElement("p");
                square.innerHTML = String.fromCharCode(64 + j);
            }
            else if(j % 9 == 0) {
                square = document.createElement("p");
                square.innerHTML = 9 - i;
            }
            else {
                square = document.createElement("div");
                square.id = "s" + ((j - 1) + 8 * (8 - i));
                square.addEventListener("click", moveAction);
                if((j + i) % 2 == 1) square.classList.add("dark");
                else square.classList.add("light");
            }

            board.appendChild(square);
        }
    }

    container.appendChild(board);
}

function loopWalls(board, index, start = null, dirI = -1) {
    if(start == index) return 1;
    if(start == null) start = index;
    let count = 0;
    let dir = [1, 8];
    for(let i = 0; i < dir.length; i++) {
        for(let k = -1; k < 2; k += 2) {
            if(index + dir[i] * k < 0 || index + dir[i] * k >= 64) count++;
            else if(Math.abs(Math.floor(index / 8) - Math.floor(index + dir[i] * k) != Math.floor(dir[i] * k / 8))) count++;
            else if(Math.abs(dirI - (i + 2 * k)) != 2 && board[index + dir[i] * k] == 1) count += loopWalls(board, index + dir[i] * k, start, i + 2 * k);
        }
    }

    return count;
}

function placeWalls(board, count) {
    for(let i = 0; i < count; i++) {
        let rand = Math.floor(Math.random() * board.length);
        if(board[rand] != 0) i--;
        else {
            board[rand] = 1;
            if(loopWalls(board) >= 2) {
                board[rand] = 0;
                i--;
            }
        }
    }
}

function placeOther(board) {
    for(let i = 0; i < 5; i++) {
        let rand = Math.floor(Math.random() * board.length);
        if(board[rand] != 0) i--;
        else {
            if(i < 2) {
                board[rand] = 3;
            }
            else if(i > 2) {
                //board[rand] = 4
            }
            else {
                board[rand] = 2;
            }
        }
    }
}

function newGame() {
    logicBoard = [];
    onTurn = 0;
    selected = -1;
    for(let i = 0; i < 64; i++) {
        document.getElementById("s" + i).style.backgroundColor = "";
        logicBoard.push(0);
    }

    placeWalls(logicBoard, 16);
    placeOther(logicBoard);

    for(let i = 0; i < 64; i++) {
        if(logicBoard[i] == 1) document.getElementById("s" + i).style.backgroundImage = "url('image/wall.png')";
        else if(logicBoard[i] == 2) document.getElementById("s" + i).style.backgroundImage = "url('image/runner.png')";
        else if(logicBoard[i] == 3) document.getElementById("s" + i).style.backgroundImage = "url('image/chaser.png')";
        else if(logicBoard[i] == 4) document.getElementById("s" + i).style.backgroundImage = "url('image/portal.png')";
        else document.getElementById("s" + i).style.backgroundImage = "";
    }
}

function movement(board, index, limit, exception) {
    let block = [];
    let moves = [];
    for(let i = 0; i < 8; i++) {
        block.push(0);
    }
    for(let i = 1; i <= limit; i++) {
        for(let k = -1; k < 2; k += 2) {
            dir = [index + i * k, index + 8 * i * k, index + 9 * i * k, index + 7 * i * k];
            for(let j = 0; j < dir.length; j++) {
                if(block[j + 4 * (k > 0)] > 0) continue;
                else if(dir[j] < 0 || dir[j] >= board.length) continue;
                else if(Math.abs(Math.floor(dir[j] / 8) - Math.floor(index / 8)) != i * (j > 0)) continue;
                else if(board[dir[j]] > 0 && exception.indexOf(board[dir[j]]) < 0) block[j + 4 * (k > 0)] = 1;
                else {
                    moves.push([index, dir[j]]);
                    if(exception.indexOf(board[dir[j]]) >= 0) block[j + 4 * (k > 0)] = 1;
                }
            }
        }
    }

    return moves;
}

var logicBoard;
var onTurn;
var selected;
var move = [];

window.onload = function() {
    let main = document.getElementById("main");

    createBoard(main);
    document.getElementById("newGame").addEventListener("click", newGame);
    document.getElementById("newGame").click();
}