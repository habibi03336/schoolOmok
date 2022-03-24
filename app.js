function onUserPut(putPosition) {
    const newPosition = omok.make_put(putPosition);
    if(newPosition === false){
        alert('you cannot put there')
    } else {
        omokBoard.updatePosition(newPosition);
        omokBoard.drawUpdate();
        const winner = omok.winner();
        if(winner !== false){
            gameOver(winner)
            return;
        }
    }
    if(omok.current_turn()===programColor){
        window.setTimeout(programPut, 250);
    }
}

function programPut(){
    const put = omokPlayProgram.put(omok);
    const newPosition = omok.make_put(put);
    omokBoard.updatePosition(newPosition);
    omokBoard.drawUpdate();
    const winner = omok.winner();
    if(winner !== false){
        gameOver(winner)
    }
}

function gameOver(winner) {
    if(winner === '1'){
        alert('White won!');
    }
    if(winner === '2'){
        alert('Black won!');
    }
    omok.clear();
    window.setTimeout(omokBoard.clear.bind(omokBoard), 1500);
    window.setTimeout(programFirstPut, 1500);
}

function onClickUndo(){
    omok.undo_put();
    omokBoard.updatePosition(omok.undo_put());
    omokBoard.drawAll();
}


function programFirstPut(){
    if(programColor === c.BLACK){
        const newPosition = omok.make_put('Hh');
        omokBoard.updatePosition(newPosition);
        omokBoard.drawUpdate();
    }
}

import * as c from './src/constants.js'
import Omok from "./src/omok.js";
import OmokBoard from "./src/omokBoard.js";
import OmokPlayProgram from "./src/omokPlayProgram.js";


let programColor = c.BLACK;
if(window.confirm('would you choose black?')){
    programColor = c.WHITE;
}

const omok = new Omok();
const omokBoard = new OmokBoard(document.body, {onClickPut: onUserPut, onClickUndo: onClickUndo});
const omokPlayProgram = new OmokPlayProgram(programColor);

programFirstPut()