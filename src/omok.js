import * as c from './constants.js';

class Omok {
    #TURN;
    #HISTORY;
    #POSITION;
    #CURRENT_CASE;

    constructor(){
        this.#init();
    }
    
    #make_put(point) { 
        if(!this.#validPoint(point)) return false;
        const row = point[0];
        const column = point[1];
        if(this.#POSITION[c.ROWS.indexOf(row)][c.COLUMNS.indexOf(column)] !== '0'){
            return false;
        }
        const cases = this.#getCases(point, this.#TURN);
        if (this.#connect33(cases)) return false;  
        this.#POSITION[c.ROWS.indexOf(row)][c.COLUMNS.indexOf(column)] = this.#TURN; 
        this.#HISTORY.push({turn: this.#TURN, point: point});
        this.#CURRENT_CASE = cases;
        this.#swap_turn();
        return this.#positionToFen();
    }

    #connect33(cases){ 
        let connect3Count = 0;
        for(let i=0; i < cases.length; i++) {
            const case1 = cases[i];
            if(this.#connect3(case1)) {
                connect3Count ++;
            }
        }
        if(connect3Count >= 2){
            return true;
        }
        return false;
    }

    #connect3(case1){
        const caseStr = case1.join('');
        if (this.#TURN === c.WHITE) {
            const regExpression = c.CONNECT3_regExp[0];
            for(let i=0; i < regExpression.length; i++){
                if(caseStr.search(regExpression[i]) !== -1){
                    return true;
                }
            }
        } else if (this.#TURN === c.BLACK) {
            const regExpression = c.CONNECT3_regExp[1];
            for(let i=0; i < regExpression.length; i++){
                if(caseStr.search(regExpression[i]) !== -1){
                    return true;
                }
            }
        }
        return false;
    }

    #winner(){
        for(let i=0; i < this.#CURRENT_CASE.length; i++){
            const case_ = this.#CURRENT_CASE[i];
            const color = (this.#TURN === c.WHITE ? c.BLACK : c.WHITE);
            if(this.#connect5(case_, color)){   
                return color;
            }
        }
        return false;
    }

    #connect5(case1, color){
        let caseStr = case1.join('');
        if(color===c.WHITE) {
            caseStr = caseStr.replace(/11111111/g, '8');
            caseStr = caseStr.replace(/1111111/g, '7');
            caseStr = caseStr.replace(/111111/g, '6');
            caseStr = caseStr.replace(/11111/g, '5');
        }
        if(color==c.BLACK) {
            caseStr = caseStr.replace(/22222222/g, '8');
            caseStr = caseStr.replace(/2222222/g, '7');
            caseStr = caseStr.replace(/222222/g, '6');
            caseStr = caseStr.replace(/22222/g, '5');
        }
        if(caseStr.search('5') !== -1){
            return true
        }
        return false;
    }

    #getCases(point, turn) {
        if(!this.#validPoint(point)) return;
        const rowNum = c.ROWS.indexOf(point[0]);
        const colNum = c.COLUMNS.indexOf(point[1]);
        const cases = [];
        cases.push(this.#getTopToBottomCase(14, rowNum, colNum, turn));
        cases.push(this.#getRightTopToLeftBottomCase(14, rowNum, colNum, turn));
        cases.push(this.#getRightToLeftCase(14, rowNum, colNum, turn));
        cases.push(this.#getRightBottomToLeftTopCase(14, rowNum, colNum, turn));
        return cases
    }

    #init(){
        this.#TURN = c.BLACK;
        this.#positionToDefault();
        this.#HISTORY = [];
        this.#CURRENT_CASE = [];
    }

    #undo_put(){
        const priorPut = this.#HISTORY.pop();
        if (!priorPut) return false;
        const row = priorPut.point[0];
        const column = priorPut.point[1];
        this.#POSITION[c.ROWS.indexOf(row)][c.COLUMNS.indexOf(column)] = '0';
        if(this.#HISTORY[0] !== undefined){
            this.#CURRENT_CASE = this.#getCases(this.#HISTORY[this.#HISTORY.length-1].point, this.#TURN);
        }
        this.#swap_turn()
        return this.#positionToFen();
    }

    #validPoint(point) {
        const row = point[0];
        const col = point[1];
        if(typeof point !== 'string' || point.length !== 2 ||
            c.ROWS.join('').search(row) == -1 || c.COLUMNS.join('').search(col) == -1) return false;
        return true
    }

    #getTopToBottomCase(len, rowNum, colNum, color) {
        const array = [];
        for(let i=0; i < len; i++) {
            if(this.#validPoint(c.ROWS[rowNum-(len-i)]+c.COLUMNS[colNum]) === true){
                array.push(this.#POSITION[rowNum-(len-i)][colNum]);   
            }       
        }
        array.push(color);
        for(let i=1; i < len+1; i++) {
            if(this.#validPoint(c.ROWS[rowNum+i]+c.COLUMNS[colNum]) === true){
                array.push(this.#POSITION[rowNum+i][colNum]);
            }
        }  
        return array;
    }

    #getRightTopToLeftBottomCase(len, rowNum, colNum, color) {
        const array = [];
        for(let i=0; i < len; i++) {
            if(this.#validPoint(c.ROWS[rowNum-(len-i)]+c.COLUMNS[colNum+(len-i)]) === true){
                array.push(this.#POSITION[rowNum-(len-i)][colNum+(len-i)])
            }
        }
        array.push(color)
        for(let i=1; i < len+1; i++) {
            if(this.#validPoint(c.ROWS[rowNum+i]+c.COLUMNS[colNum-i]) === true){
                array.push(this.#POSITION[rowNum+i][colNum-i])
            }
        }
        return array;
    }

    #getRightToLeftCase(len, rowNum, colNum, color) {
        const array = [];
        for(let i=0; i < len; i++) {
            if(this.#validPoint(c.ROWS[rowNum]+c.COLUMNS[colNum+(len-i)]) === true){
                array.push(this.#POSITION[rowNum][colNum+(len-i)])
            }
        }
        array.push(color);
        for(let i=1; i < len+1; i++) {
            if(this.#validPoint(c.ROWS[rowNum]+c.COLUMNS[colNum-i]) === true){
                array.push(this.#POSITION[rowNum][colNum-i])
            }
        }
        return array;
    }

    #getRightBottomToLeftTopCase(len, rowNum, colNum, color) {
        const array = [];
        for(let i=0; i < len; i++) {
            if(this.#validPoint(c.ROWS[rowNum+(len-i)]+c.COLUMNS[colNum+(len-i)]) === true){
                array.push(this.#POSITION[rowNum+(len-i)][colNum+(len-i)])
            }
        }
        array.push(color)
        for(let i=1; i < len+1; i++) {
            if(this.#validPoint(c.ROWS[rowNum-i]+c.COLUMNS[colNum-i]) === true){
                array.push(this.#POSITION[rowNum-i][colNum-i])
            }
        }
        return array;
    }

    #positionToDefault() {
        const position = c.DEFAULT_FEN.split('/');
        const defaultPosition = [];
        for(let i=0; i < position.length; i++){
            defaultPosition[i] = position[i].split('');
        }
        this.#POSITION=  defaultPosition;
    }

    #positionToFen() {
        const position = this.#deepCopy(this.#POSITION);
        for(let i=0; i < position.length; i++){
            position[i] = position[i].join('');
        }
        const fen = position.join('/')
        return fen;
    }

    #swap_turn() {
        this.#TURN = (this.#TURN === c.BLACK) ? c.WHITE : c.BLACK; 
    }

    #deepCopy(thing) {
        return JSON.parse(JSON.stringify(thing));
    }

    make_put(point){
        return this.#make_put(point)
    }

    undo_put(){
        return this.#undo_put()
    }

    winner(){
        return this.#winner()
    }

    clear(){
        return this.#init()
    }

    position() {
        return this.#POSITION;
    }

    current_case() {
        return this.#CURRENT_CASE;
    }
    current_turn() {
        return this.#TURN;
    }
    emptyPoint_case(point) {
        return this.#getCases(point, '0');
    }
}

export default Omok;
