import * as c from './constants.js';

class OmokPlayProgram{
    static CONNECT1_regExp = {WHITE:[/010/], BLACK: [/020/]};
    static CONNECT2_regExp = {WHITE:[/0110/,/01010/,/010010/],BLACK:[/0220/,/02020/,/020020/]};
    static CONNECT3_regExp = {
        WHITE: [/211100/,/001112/,/210110/,/010112/,/211010/,/011012/],
        BLACK: [/122200/,/002221/,/120220/,/020221/,/122020/,/022021/]
    };
    static CONNECT3_regExp_critical = {WHITE: [/01110/,/010110/,/011010/],BLACK: [/02220/,/020220/,/022020/]};
    static CONNECT4_regExp = {
        WHITE: [/01111/,/10111/,/11011/,/11101/,/11110/],
        BLACK: [/02222/,/20222/,/22022/,/22202/,/22220/]
    }
    static CONNECT4_regExp_critical = {WHITE: [/011110/], BLACK: [/022220/]}
    static CONNECT5_regExp = {WHITE: [/11111/], BLACK: [/22222/]}
    static CONNECTLong_regExp = {WHITE: [/111111/,/1111111/,/11111111/], BLACK:[/222222/,/2222222/,/22222222/]}

    #CRITICAL34ATTACk;
    #CRITICAL34DEFENSE;
    #programColor;

    constructor(programColor){
        this.#programColor = programColor
    }


    #getPossiblePuts(position) {
        const positions = [];
        const positionsAll = [];
        for(let i=0; i < 15; i++) {
            for(let j=0; j < 15; j++){
                if(position[i][j] !== '0'){
                    positions.push(c.ROWS[i]+c.COLUMNS[j]);
                }
                positionsAll.push(c.ROWS[i]+c.COLUMNS[j]);
            }
        }
        const possiblePut = positionsAll.filter(x => !positions.includes(x));
        return possiblePut
    }

    #getBestPuts(possiblePut, omok){
        const candidatePuts = [];
        const scoreDiffs = [];
        for(let i=0; i < possiblePut.length; i++){
            const casesBeforePut = omok.emptyPoint_case(possiblePut[i]);
            if(omok.make_put(possiblePut[i]) === false) {
                continue;
            }
            const casesAfterPut = omok.current_case();
            omok.undo_put()
            const scoreDiff = this.#calculateScoreDiff(casesBeforePut, casesAfterPut, omok);
            candidatePuts.push(possiblePut[i]);
            scoreDiffs.push(scoreDiff);
        }
        const descScoreDiffs = this.#deepCopy(scoreDiffs).sort((a, b) => b-a)

        const turn = omok.current_turn();

        //returning opponent's bestput and score
        if(turn !== this.#programColor) {
            return descScoreDiffs[0];
        }

        //returning 2 best scored puts(sometimes more) 
        const bestPuts = candidatePuts.filter((x,index) => {return scoreDiffs[index] >= descScoreDiffs[1]}) 
        return bestPuts
    }


    #theBestPut(bestPuts, omok){
        let oppBestScoreMin = 9999999;
        let theBestPut;
        for(let i=0; i < bestPuts.length; i++){
            omok.make_put(bestPuts[i]);
            const possiblePuts = this.#getPossiblePuts(omok.position()); 
            let oppBestScore = this.#getBestPuts(possiblePuts, omok);
            omok.undo_put();

            console.log('put on : ' + bestPuts[i] + ' and opponent get score of : ' + oppBestScore)

            if(oppBestScore >= 99000){ 
                console.log('oppbestScore minus 110,000') //maybe it is a excellent 4 in a row attack option that makes opponent defensive' 
                oppBestScore -= 110000;
            } else if(oppBestScore >= 9900){
                console.log('oppbestScore minus 11,000')  //maybe it is a good 3 in a row attack option'
                oppBestScore -= 11000;
            } 

            if(oppBestScore < oppBestScoreMin){  
                oppBestScoreMin = oppBestScore;
                theBestPut = bestPuts[i];
            }
        }
        console.log('opponents get MIN score with : ' + theBestPut + ' (' + oppBestScoreMin + ')')
        console.log('-'.repeat(30));
        return theBestPut;
    }

    #calculateScoreDiff(casesBefore, casesAfter, omok){
        let scoreDiffTotal = 0;
        this.#CRITICAL34ATTACk = 0;
        this.#CRITICAL34DEFENSE = 0;
        for(let i=0; i < casesBefore.length; i++){
            const caseBefore = casesBefore[i];
            const caseAfter = casesAfter[i];
            if(omok.current_turn()===c.WHITE){
                scoreDiffTotal += this.#scoringStrategy('WHITE', caseBefore, caseAfter)
            } else {
                scoreDiffTotal += this.#scoringStrategy('BLACK', caseBefore, caseAfter)
            }
        }
        if(this.#CRITICAL34ATTACk >= 2){
            console.log('critical34 Attack! good bye');
            scoreDiffTotal += 40000;
        }

        if(this.#CRITICAL34DEFENSE >= 2){
            console.log('critical34 Defense! thank God');
            scoreDiffTotal += 60000;
        }
        
        return scoreDiffTotal;
    }

    #scoringStrategy(color, caseBefore, caseAfter){
        const myColor = color;
        const oppColor = (myColor=== 'WHITE' ? 'BLACK' : 'WHITE')
        let caseScoreDiff = 0;

        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT1_regExp[oppColor], caseBefore, caseAfter, -2);
        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT2_regExp[oppColor], caseBefore, caseAfter, -55);
        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT3_regExp[oppColor], caseBefore, caseAfter, -40);
        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT3_regExp_critical[oppColor], caseBefore, caseAfter, -10000);
        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT4_regExp[oppColor], caseBefore, caseAfter, -100000);

        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT2_regExp[myColor], caseBefore, caseAfter, +25);
        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT3_regExp[myColor], caseBefore, caseAfter, +20);
        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT3_regExp_critical[myColor], caseBefore, caseAfter, +125);
        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT4_regExp[myColor], caseBefore, caseAfter, +70);
        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT4_regExp_critical[myColor], caseBefore, caseAfter, +40000);
        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECT5_regExp[myColor], caseBefore, caseAfter, +1000000);
        caseScoreDiff += this.#regExpressionScoring(OmokPlayProgram.CONNECTLong_regExp[myColor], caseBefore, caseAfter, -1000000);

        
        for(let j=0; j < OmokPlayProgram.CONNECT3_regExp_critical[myColor].length; j++){
            if(caseAfter.join('').search(OmokPlayProgram.CONNECT3_regExp_critical[myColor][j]) !== -1){
                this.#CRITICAL34ATTACk ++;
            };
        }
        for(let j=0; j < OmokPlayProgram.CONNECT4_regExp[myColor].length; j++){
            if(caseAfter.join('').search(OmokPlayProgram.CONNECT4_regExp[myColor][j]) !== -1){
                this.#CRITICAL34ATTACk ++;
            };
        }
        
        for(let j=0; j < OmokPlayProgram.CONNECT3_regExp_critical[oppColor].length; j++){
            if(caseBefore.join('').search(OmokPlayProgram.CONNECT3_regExp_critical[oppColor][j]) !== -1){
                this.#CRITICAL34DEFENSE ++;
            };
        }
        for(let j=0; j < OmokPlayProgram.CONNECT4_regExp[oppColor].length; j++){
            if(caseBefore.join('').search(OmokPlayProgram.CONNECT4_regExp[oppColor][j]) !== -1){
                this.#CRITICAL34DEFENSE ++;
            };
        }

        return caseScoreDiff
    }

    #regExpressionScoring(regExpressionArray, caseBefore, caseAfter, scoreWeight){
        let scoreBefore = 0;
        let scoreAfter = 0;
        for(let j=0; j < regExpressionArray.length; j++){
            if(caseBefore.join('').search(regExpressionArray[j]) !== -1){
                scoreBefore += scoreWeight;
            };
        }
        for(let j=0; j < regExpressionArray.length; j++){
            if(caseAfter.join('').search(regExpressionArray[j]) !== -1){
                scoreAfter += scoreWeight;
            };
        }
        return (scoreAfter - scoreBefore);
    }

    #deepCopy(thing) {
        return JSON.parse(JSON.stringify(thing));
    }

    #put(omok){
        const possiblePut = this.#getPossiblePuts(omok.position());
        const bestPuts = this.#getBestPuts(possiblePut, omok);  
        const bestPut = this.#theBestPut(bestPuts, omok);
        return bestPut;
    }

    put(omok){
        return this.#put(omok);
    }
}

export default OmokPlayProgram;