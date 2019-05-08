(ERManager => {

    let SILENT_MODE = false;

    const RAT_WIDTH = parseInt(getComputedStyle(document.body).getPropertyValue('--rat-width'));
    const RAT_HEIGHT = parseInt(getComputedStyle(document.body).getPropertyValue('--rat-height'));

    const RAT = {
        MANAGER: 'manager',
        EMPLOYEE: 'employee',
        DISABLED: 'disabled'
    };

    Array.prototype.shuffle = function () {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    };

    class Rat {
        constructor(type, index) {
            this.type = type;
            this.index = index;
            this.infected = false;
            this.triage = 3;
            if (!SILENT_MODE) {
                this.img = document.createElement("img");
                this.img.src = `game/rats/rat.png`; // `game/rats/${type}.png`;
                document.getElementById('board').appendChild(this.img);
            }
        }

        setPos(pos) {
            if (this.img) {
                this.img.style.transform = `translate(${pos.x * RAT_WIDTH}px, ${pos.y * RAT_HEIGHT + 10}px)`;
            }
            return this;
        }

        setOpacity(opacity) {
            if (this.img) {
                this.img.style.opacity = opacity;
            }
            return this;
        }

        die() {
            if (this.img) {
                this.img.src = `game/rats/rat_dead.png`;
            }
            this.destroy();
        }

        destroy() {
            this.setOpacity(0);
            if (this.img) {
                setTimeout(
                    () => {
                        if (this.img) {
                            document.getElementById('board').removeChild(this.img);
                            this.img = null;
                        }
                    }, 1000
                )
            }
        }
    }

    class Street {
        constructor(X, Y) {
            this.X = X;
            this.Y = Y;
            const ratTypes = new Array(100);
            ratTypes.fill(RAT.MANAGER, 0, 20);
            ratTypes.fill(RAT.EMPLOYEE, 20, 70);
            ratTypes.fill(RAT.DISABLED, 70, 100);

            this.rats = ratTypes
                .shuffle()
                .map((type, index) => new Rat(type, index));

            this.update();
        }

        update() {
            this.rats.forEach((rat, index) => rat
                .setPos({x: -index + 11 + this.X, y: this.Y})
                .setOpacity(Math.max(0, 1 - index / 6))
            );
        }

        pickRat() {
            const rat = this.rats.shift();
            this.update();
            return rat;
        }

        isEmpty() {
            return this.rats.length === 0;
        }

        destroy() {
            this.rats.forEach(rat => rat.destroy());
        }
    }

    class Hall {
        constructor(capacity, X, Y) {
            this.X = X;
            this.Y = Y;
            this.capacity = capacity;
            this.rats = new Array(capacity).fill(null);
            this.numOfDeaths = 0;

            if (!SILENT_MODE) {

                new Array(capacity)
                    .fill(true)
                    .map( () => document.createElement("div"))
                    .forEach( (div, index) => {
                        div.style.height = '10px';
                        div.style.width = '10px';
                        div.style.backgroundColor = 'red';
                        div.style.transform = `translate(${pos.x * RAT_WIDTH}px, ${pos.y * RAT_HEIGHT + 10}px)`;
                        document.getElementById('board').appendChild(this.img);

                    });

            }
        }

        isFull() {
            return this.rats.every(r => !!r);
        }
        isEmpty() {
            return this.rats.every(r => !r);
        }

        update() {
            this.rats.forEach( (rat, index) => {
               if (rat) {
                   rat.triage--;
                   if (rat.triage <= 0) {
                       rat.die();
                       this.numOfDeaths++;
                       this.rats[index] = null;
                       console.log(`Rat #${index+1} died`);
                   }
               }
            });
        }

        pushRat(rat) {
            const freeIndexes = this.rats
                .map( (rat, index) => rat ? -1 : index)
                .filter(index => index >= 0);

            if (rat && freeIndexes.length) {
                const index = freeIndexes[ Math.floor( Math.random() * freeIndexes.length)];
                this.rats[index] = rat.setPos({x: this.X + index, y: this.Y});
            }
        }

        hasRat(index) {
            return index >= 0 && index < this.capacity && !!this.rats[index];
        }
        pickRat(index) {
            if (this.hasRat(index)) {
                const pickedRat = this.rats[index];
                this.rats[index] = null;
                return pickedRat;
            } else return null;
        }

        destroy() {
            this.rats.forEach(rat => rat && rat.destroy());
        }
    }

    class Surgery {
        constructor(X, Y) {
            this.rat = null;
            this.timer = 0;
            this.X = X;
            this.Y = Y;
        }

        isFull() {
            return !!this.rat;
        }
        isEmpty() {
            return !this.rat;
        }

        pushRat(rat) {
            if (rat && !this.rat) {
                this.rat = rat.setPos({x: this.X, y: this.Y});
                this.timer = 0;
                return true;
            } else {
                return false;
            }
        }

        update() {
            if (this.rat) {
                if (this.timer >= 1) {
                    this.rat.destroy();
                    this.rat = null;
                    this.timer = 0;
                } else {
                    this.timer++;
                }
            }
        }
        destroy() {
            this.rat && this.rat.destroy();
        }
    }

    class Game {
        constructor() {
            document.getElementById('slow-run').onclick = () => this.run(800);
            document.getElementById('step').onclick = () => this.doAStep(true);
            document.getElementById('fast-run').onclick = () => this.run(100);
            document.getElementById('instant-run').onclick = () => this.run(0);
            document.getElementById('pause').onclick = () => this.run(undefined);
            document.getElementById('reset').onclick = () => this.reset();
            document.getElementById('average').onclick = () => this.calculateAverage(1000);

            this.rules = [
                () => this.hall.numOfDeaths

                /*
                () => this.rooms[ROOM.UNDERGROUND_GARAGE].rats
                    .reduce((sum, rat, position) => sum + (rat.type === RAT.MANAGER && position >= 20 ? 10 : 0), 0),
                () => this.rooms[ROOM.RENO_COURT].rats
                        .reduce((sum, rat, position) => sum + (rat.type === RAT.DISABLED ? Math.max(10 - position, 0) : 0), 0)
                    + this.rooms[ROOM.OPEN_AREA].rats
                        .reduce((sum, rat, position) => sum + (rat.type === RAT.DISABLED ? Math.max(10 - position, 0) : 0), 0),
                () => this.rooms[ROOM.UNDERGROUND_GARAGE].rats
                        .reduce((sum, rat) => sum + (rat.type === RAT.EMPLOYEE ? 2 : 0), 0)
                    + this.rooms[ROOM.RENO_COURT].rats
                        .reduce((sum, rat) => sum + (rat.type === RAT.EMPLOYEE ? 2 : 0), 0)
                    + this.rooms[ROOM.OPEN_AREA].rats
                        .reduce((sum, rat) => sum + (rat.type === RAT.EMPLOYEE ? 2 : 0), 0)
            */];

            this.reset();
        }

        reset() {
            if (this.street)
                this.street.destroy();
            if (this.hall)
                this.hall.destroy();
            if (this.surgeries) {
                this.surgeries.forEach(surgery => surgery.destroy());
            }

            this.street = new Street(-6, 6);
            try {
                this.erManager = new ERManager();
            } catch (e) {
                console.error('Cannot create new ERManager', e);
            }

            this.hall = new Hall(5,8, 6);

            this.surgeries = [
                new Surgery(7, 4),
                new Surgery(10, 4),
                new Surgery(9, 2)
            ];

            this.speed = undefined;
            this.updateUI(true, [0, 0, 0]);
        }

        showProgress(label) {
            document.getElementById('progress').style.display = !!label ? 'block' : 'none';
            document.getElementById('progress').innerHTML = label;
            SILENT_MODE = !!label;
        }

        calculateAverage(numOfRounds) {
            this.showProgress(`Calculating ${numOfRounds} rounds...`);
            setTimeout(() => {
                const sumScores = [0, 0, 0];
                for (let n = 0; n < numOfRounds; n++) {
                    this.reset();
                    let c;
                    do {
                        c = this.doAStep();
                    } while (c);

                    const scores = this.calculateScores();
                    scores.forEach((score, index) => sumScores[index] += score);
                }
                const averageScores = sumScores.map(sum => sum / numOfRounds);
                this.showProgress(false);
                this.updateUI(false, averageScores, numOfRounds);
            }, 0);
        }

        run(speed) {
            const stopped = this.speed === undefined;
            this.speed = speed;

            if (this.speed === undefined) {
                this.updateUI(true );
            }
            if (stopped) {
                this.doAStep();
            }
        }

        calculateScores() {
            return this.rules.map(rule => rule());
        }

        updateUI(doContinue, scores, numOfRounds) {

            document.getElementById('rounds').innerHTML = numOfRounds ? `(${numOfRounds} rounds)` : '';

            if (scores) {
                const total = scores.reduce((sum, score) => sum + score, 0);
                document.getElementById('score1').innerHTML = numOfRounds ? parseFloat(scores[0]).toFixed(2) : scores[0];
                //document.getElementById('score2').innerHTML = numOfRounds ? parseFloat(scores[1]).toFixed(2) : scores[1];
                //document.getElementById('score3').innerHTML = numOfRounds ? parseFloat(scores[2]).toFixed(2) : scores[2];
                document.getElementById('totalScore').innerHTML = numOfRounds ? parseFloat(total).toFixed(2) : total;
            }

            document.getElementById('step').disabled = !doContinue || this.speed;
            document.getElementById('slow-run').disabled = !doContinue;
            document.getElementById('fast-run').disabled = !doContinue;
            document.getElementById('instant-run').disabled = !doContinue;
            document.getElementById('pause').disabled = !doContinue || this.speed === undefined;
            document.getElementById('reset').disabled = this.street.rats.length === 100;

            console.log('SPEED', this.speed);
        }



        doAStep(force) {
            let doContinue = false;
            if (force || SILENT_MODE || this.speed !== undefined) {
                try {
                    const result = this.erManager.redirectRatToSurgery();

                    if (result
                        && result.rat >= 1 && result.rat <= 5
                        && result.surgery >= 1 && result.surgery  <= 3) {

                        console.log(`Redirecting rat #${result.rat} to surgery #${result.surgery}`);

                        // UPDATES

                        this.hall.update();
                        this.surgeries.forEach(surgery => surgery.update());

                        // HALL -> SURGERY

                        {
                            const ratIndex = result.rat-1;
                            const surgery = this.surgeries[result.surgery-1];

                            if (!this.hall.hasRat(ratIndex)) {
                                console.log(`No rat is sitting at position #${result.rat}!`);
                            }
                            else if (surgery.isFull()) {
                                console.log(`Surgery #${result.surgery} is full!`);
                            } else {
                                const rat = this.hall.pickRat(ratIndex);
                                surgery.pushRat(rat);
                            }
                        }

                        // STREET -> HALL

                        {
                            if (this.street.isEmpty()) {
                                console.log(`No more rat in the street!`);
                            }
                            else if (this.hall.isFull()) {
                                console.log(`Hall is full!`);
                            } else {
                                const rat = this.street.pickRat();
                                this.hall.pushRat(rat);
                            }
                        }

                        // NEXT STEP
                        const empty = this.street.isEmpty() && this.hall.isEmpty()
                            && this.surgeries.every(surgery => surgery.isEmpty());

                        doContinue = !empty;

                        if (!SILENT_MODE && doContinue && this.speed !== undefined) {
                            setTimeout(() => this.doAStep(), this.speed);
                        }
                        if (!SILENT_MODE && !doContinue) {
                            this.speed = undefined;
                        }
                    } else {
                        console.error(`${result} is not a valid response`);
                        this.reset();
                    }

                } catch (e) {
                    console.error('erManager.redirectRatToSurgery() crashed.', e);
                    this.reset();
                }
                if (!SILENT_MODE) {
                    this.updateUI(doContinue, this.calculateScores());
                }
            }
            return doContinue;
        }
    }

    new Game();

})(ERManager);





