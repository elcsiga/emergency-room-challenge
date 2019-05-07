(ERManager => {

    let SILENT_MODE = false;

    const RAT_WIDTH = parseInt(getComputedStyle(document.body).getPropertyValue('--rat-width'));
    const RAT_HEIGHT = parseInt(getComputedStyle(document.body).getPropertyValue('--rat-height'));

    const RAT = {
        MANAGER: 'manager',
        EMPLOYEE: 'employee',
        DISABLED: 'disabled'
    };

    const ROOM = {
        UNDERGROUND_GARAGE: 'underground-garage',
        RENO_COURT: 'reno-court',
        OPEN_AREA: 'open-area'
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
            this.illness = 3;
            this.index = index;
            this.infected = false;
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

        heal() {
            this.illness--;
        }

        isIll() {
            return this.illness > 0;
        }

        destroy() {
            this.setOpacity(0);
            setTimeout(
                () => {
                    if (this.img) {
                        document.getElementById('board').removeChild(this.img);
                        this.img = null;
                    }
                }, 300
            )
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

        }

        isFull() {
            return this.rats.every(r => !!r);
        }
        isEmpty() {
            return this.rats.every(r => !r);
        }

        pushRat(rat) {
            const firstEmptyIndex = this.rats.findIndex(rat => rat === null);
            if (rat && firstEmptyIndex >= 0) {
                this.rats[firstEmptyIndex] = rat.setPos({x: this.X + firstEmptyIndex, y: this.Y});
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

    class Room {
        constructor(capacity, X, Y) {
            this.capacity = capacity;
            this.rats = new Array(capacity).fill(null);
            this.X = X;
            this.Y = Y;
            this.numOfInfetcions = 0;
        }

        isFull() {
            return this.rats.every(r => !!r);
        }
        isEmpty() {
            return this.rats.every(r => !r);
        }

        pushRat(rat) {
            const firstEmptyIndex = this.rats.findIndex(rat => rat === null);
            if (rat && firstEmptyIndex >= 0) {
                this.rats[firstEmptyIndex] = rat.setPos({x: this.X + firstEmptyIndex, y: this.Y});
                return true;
            } else {
                return false;
            }
        }

        update() {

            const trueRats = this.rats.filter( rat => !!rat);

            // infecting
            const numOfInfetedRats = trueRats.reduce((sum, rat) => sum += (rat.infected ? 1 : 0), 0);
            if (numOfInfetedRats > 0) {
                trueRats.forEach(rat => {
                    if (!rat.infected) {
                        rat.infected = true;
                        this.numOfInfetcions++;
                    }
                });
            }

            // healing
            this.rats.forEach((rat, index) => {
                if (rat) {
                    rat.heal();
                    if (!rat.isIll()) {
                        this.rats[index] = null;
                        rat.destroy();
                    }
                }
            });
        }

        destroy() {
            this.rats.forEach(rat => rat && rat.destroy());
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
                () => this.rooms.reduce((sum, room) => sum - room.numOfInfetcions, 0)
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
            if (this.rooms) {
                this.rooms.forEach(room => room.destroy());
            }

            this.street = new Street(-6, 6);
            try {
                this.erManager = new ERManager();
            } catch (e) {
                console.error('Cannot create new ERManager', e);
            }

            this.hall = new Hall(5,8, 6);

            this.rooms = [
                new Room(1, 7, 4),
                new Room(2, 10, 4),
                new Room(3, 9, 2),
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
            if (stopped) {
                this.doAStep();
            }

        }

        calculateScores() {
            return this.rules.map(rule => rule());
        }

        updateUI(doContinue, scores, numOfRounds) {
            const total = scores.reduce((sum, score) => sum + score, 0);

            document.getElementById('rounds').innerHTML = numOfRounds ? `(${numOfRounds} rounds)` : '';

            document.getElementById('score1').innerHTML = numOfRounds ? parseFloat(scores[0]).toFixed(2) : scores[0];
            //document.getElementById('score2').innerHTML = numOfRounds ? parseFloat(scores[1]).toFixed(2) : scores[1];
            //document.getElementById('score3').innerHTML = numOfRounds ? parseFloat(scores[2]).toFixed(2) : scores[2];
            document.getElementById('totalScore').innerHTML = numOfRounds ? parseFloat(total).toFixed(2) : total;

            document.getElementById('slow-run').disabled = !doContinue;
            document.getElementById('fast-run').disabled = !doContinue;
            document.getElementById('instant-run').disabled = !doContinue;
            document.getElementById('pause').disabled = !doContinue || this.speed === undefined;
            document.getElementById('reset').disabled = this.street.rats.length === 100;
        }



        doAStep(force) {
            let doContinue = false;
            if (force || SILENT_MODE || this.speed !== undefined) {
                try {
                    const result = this.erManager.redirectRatToRoom();

                    if (result
                        && result.rat >= 1 && result.rat <= 5
                        && result.room >= 1 && result.room  <= 5) {

                        console.log(`Redirecting rat #${result.rat} to room #${result.room}`);

                        // ROOM -> OUT

                        this.rooms.forEach(room => room.update());

                        // HALL -> ROOM

                        {
                            const ratIndex = result.rat-1;
                            const room = this.rooms[result.room-1];

                            if (!this.hall.hasRat(ratIndex)) {
                                console.log(`No rat is sitting at position #${result.rat}!`);
                            }
                            else if (room.isFull()) {
                                console.log(`Room #${result.room} is full!`);
                            } else {
                                const rat = this.hall.pickRat(ratIndex);
                                room.pushRat(rat);
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
                            && this.rooms.every(room => room.isEmpty());

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
                    console.error('erManager.redirectRatToRoom() crashed.', e);
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





