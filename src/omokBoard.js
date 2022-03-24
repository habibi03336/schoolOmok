import * as c from './constants.js';

class OmokBoard {
    #CURRENT_POSITION;
    #CURRENT_PUT = '';
    #TEMPORARY_PUT = '';


    constructor(containerEl, cfg){
        this.#CURRENT_POSITION = this.#fenToObj(c.DEFAULT_FEN);
        containerEl.appendChild(this.#buildBoard());
        
        document.querySelectorAll('.point').forEach(($point)=> {
            $point.addEventListener('click', (e) => {
                this.#eraseTemporayPut(this.#TEMPORARY_PUT);
                this.#TEMPORARY_PUT = e.target.id[6]+e.target.id[7];
                if(this.#CURRENT_POSITION[this.#TEMPORARY_PUT] !== '0'){
                    this.#TEMPORARY_PUT = '';
                }
                this.#temporaryPut(this.#TEMPORARY_PUT)
            })
        })
    
        document.getElementById('put').addEventListener('click', (e) => {
            if (cfg.hasOwnProperty('onClickPut') === true && typeof cfg.onClickPut === 'function'){
                this.#eraseTemporayPut(this.#TEMPORARY_PUT)
                cfg.onClickPut(this.#TEMPORARY_PUT)
                this.#TEMPORARY_PUT = '';
            }
        })
    
        document.getElementById('undo').addEventListener('click', (e) => {
            if (cfg.hasOwnProperty('onClickUndo') === true && typeof cfg.onClickUndo === 'function'){
                cfg.onClickUndo()
            }
        })
    }


    #buildBoard() {
        const $board = document.createElement('div');
        $board.classList += 'board';
        for (let i=0; i < 15; i++){
            $board.appendChild(this.#buildpoint(c.ROWS[i]));
        }
        const $putButton = document.createElement('div');
        $putButton.id = 'put';
        $putButton.textContent = 'put';
        $putButton.classList += 'control';
        const $undoButton = document.createElement('div');
        $undoButton.id = 'undo';
        $undoButton.textContent = 'undo';
        $undoButton.classList += 'control';
        $board.append($putButton, $undoButton);
        return $board
    }

    #buildpoint(rowNum){
        const $row = document.createElement('div');
        $row.classList += 'row';
        for (let i=0; i < 15; i++){
            const $point = document.createElement('div');
            $point.id = `point-${rowNum}${c.COLUMNS[i]}`;
            $point.classList += 'point';
            $row.appendChild($point);
        }
        return $row
    }


    #drawUpdate() {
        if(this.#CURRENT_POSITION[this.#CURRENT_PUT] === c.WHITE) {
            document.getElementById(`point-${this.#CURRENT_PUT}`).append(this.#drawGo(c.WHITE));
            this.#drawHighlight() 
        } else if(this.#CURRENT_POSITION[this.#CURRENT_PUT] === c.BLACK) {
            document.getElementById(`point-${this.#CURRENT_PUT}`).append(this.#drawGo(c.BLACK));
            this.#drawHighlight()
        }
    }

    #drawAll() {
        this.#clearBoard()
        for (let point in this.#CURRENT_POSITION){
            if(this.#CURRENT_POSITION[point] === c.WHITE) {
                document.getElementById(`point-${point}`).append(this.#drawGo(c.WHITE)); 
            } else if(this.#CURRENT_POSITION[point] === c.BLACK) {
                document.getElementById(`point-${point}`).append(this.#drawGo(c.BLACK));
            }
        }
    }

    #clearBoard() {
        document.querySelectorAll('.point').forEach(($point) => {
            $point.classList.remove('highlight');
            $point.textContent = '';
        })
    }

    #drawGo(color) {
        const $img = document.createElement('img');
        $img.classList += 'go';
        if (color === c.WHITE) {
            $img.id = 'whiteGo';
            $img.src = 'img/white.png'
        }
        else if (color === c.BLACK) {
            $img.id = 'blackGo';
            $img.src = 'img/black.png'
        } else {
            $img.id = 'redGo';
            $img.src = 'img/red.png'
        }
        return $img
    }

    #drawHighlight(){
        document.getElementById(`point-${this.#CURRENT_PUT}`).classList += ' highlight'; 
    }

    #eraseHightlight(){
        if (this.#CURRENT_PUT) document.getElementById(`point-${this.#CURRENT_PUT}`).classList.remove('highlight'); 
    }

    #backToDefault(){
        this.#CURRENT_POSITION = this.#fenToObj(c.DEFAULT_FEN);
        this.#CURRENT_PUT = '';
        this.#TEMPORARY_PUT = '';
    }   

    #fenToObj(fen) {
        fen = fen.replace(/ .+$/, '');
        const rows = fen.split('/');
        const position = {};
        for (let i=0; i < 15; i++){
            for (let j=0; j < 15; j++){
                position[c.ROWS[i]+c.COLUMNS[j]] = rows[i][j]
            }
        }
        return position;
    }

    #temporaryPut(point){ 
        if(this.#CURRENT_POSITION.hasOwnProperty(point) === true && this.#CURRENT_POSITION[point] !== '0')     return;
        if (point !== '') document.getElementById(`point-${point}`).append(this.#drawGo('red'));
    }

    #eraseTemporayPut(point){
        if (point !== '') document.getElementById(`point-${point}`).innerHTML = '';
    }

    #updatePosition(fen){
        if (!fen) return;
        const newPosition = this.#fenToObj(fen);
        this.#eraseHightlight();
        for(let key in newPosition){
            if(this.#CURRENT_POSITION[key] !== newPosition[key]){
                this.#CURRENT_PUT = key;
                break;
            }
        }
        this.#CURRENT_POSITION = newPosition;
    }

    updatePosition(fen){
        this.#updatePosition(fen);
    }
    drawUpdate(){
        this.#drawUpdate();
    }

    drawAll(){
        this.#drawAll();
    }

    clear(){
        this.#clearBoard();
        this.#backToDefault();
    }

}

export default OmokBoard;

