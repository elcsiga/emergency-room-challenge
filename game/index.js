(ERManager => {

    function log(...args) {
        if (window.logRats) {
            console.log(...args);
        }
    }

    let SILENT_MODE = false;

    const RAT_WIDTH = parseInt(getComputedStyle(document.body).getPropertyValue('--rat-width'));
    const RAT_HEIGHT = parseInt(getComputedStyle(document.body).getPropertyValue('--rat-height'));

    Array.prototype.shuffle = function () {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    };

    class Rat {
        constructor() {
            this.infected = Math.random() > .5;
            this.triage = Math.floor(Math.random() * 10) + 1;
            if (!SILENT_MODE) {
                this.img = document.createElement("img");
                this.img.src = this.infected ? `game/rats/rat_black.png` : `game/rats/rat.png`;
                document.getElementById('board').appendChild(this.img);
            }
        }

        setPos(pos) {
            if (this.img) {
                this.img.style.transform = `translate(${pos.x * RAT_WIDTH}px, ${pos.y * RAT_HEIGHT + 10 + 5}px)`;
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
                this.img.src = this.infected ? `game/rats/rat_black_dead.png` : `game/rats/rat_dead.png`;
            }
            this.destroy();
        }

        heal() {
            if (this.img) {
                this.img.src = this.infected ? `game/rats/rat_black_heal.png` : `game/rats/rat_white_heal.png`;
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

            this.rats = new Array(100)
                .fill(true)
                .map(() => new Rat());

            this.update();
        }

        update() {
            this.rats.forEach((rat, index) => rat
                .setPos({x: -index + 10.6 + this.X, y: this.Y})
                .setOpacity(index < 3 ? 1 : 0)
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
                this.signs = new Array(this.capacity)
                    .fill(true)
                    .map(() => document.createElement("div"))
                    .map((div, index) => {
                        div.style.left = `${(index + this.X) * RAT_WIDTH + 12}px`;
                        div.style.top = `${RAT_HEIGHT * this.Y - 14}px`;
                        div.innerHTML = '-';
                        document.getElementById('board').appendChild(div);
                        return div;
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
            this.rats.forEach((rat, index) => {
                if (rat) {
                    rat.triage--;
                    if (rat.triage <= 0) {
                        rat.die();
                        this.numOfDeaths++;
                        this.rats[index] = null;
                        log(`Rat #${index + 1} died`);
                    }
                }
            });
        }

        updateSigns() {
            if (!SILENT_MODE) {
                this.rats.forEach((rat, index) => {
                    this.signs[index].innerHTML = rat ? rat.triage : '-';
                });
            }
        }

        pushRat(rat) {
            const freeIndexes = this.rats
                .map((rat, index) => rat ? -1 : index)
                .filter(index => index >= 0);

            if (rat && freeIndexes.length) {
                const index = freeIndexes[Math.floor(Math.random() * freeIndexes.length)];
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
            if (this.signs) {
                this.signs.forEach(
                    div => document.getElementById('board').removeChild(div)
                );
            }
        }
    }

    class Surgery {
        constructor(time, X, Y) {
            this.rat = null;
            this.timer = 0;
            this.X = X;
            this.Y = Y;
            this.time = time;
            this.pair = null;
            this.numOfInfections = 0;
            this.numOfHealedWhiteRats = 0;
            this.numOfHealedBlackRats = 0;
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

                // infect
                if (this.pair && this.pair.rat && !this.rat.infected && this.pair.rat.infected) {
                    this.rat.die();
                    this.numOfInfections++;
                    this.rat = null;
                    this.timer = 0;
                }

                // heal
                this.timer++;
                if (this.timer >= this.time) {
                    this.rat.infected ? this.numOfHealedBlackRats++ : this.numOfHealedWhiteRats++;
                    this.rat.heal();
                    this.rat = null;
                    this.timer = 0;
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
                () => this.hall.numOfDeaths,
                () => this.surgeries[0].numOfInfections + this.surgeries[1].numOfInfections,
                () => Math.abs( this.surgeries.reduce((sum, surgery) =>
                    sum + surgery.numOfHealedBlackRats - surgery.numOfHealedWhiteRats, 0) )
            ];

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

            this.street = new Street(-8, 6);
            try {
                this.erManager = new ERManager();
            } catch (e) {
                console.error('Cannot create new ERManager', e);
            }

            this.hall = new Hall(5, 5, 6);

            this.surgeries = [
                new Surgery(2, 5, 4),
                new Surgery(3, 7, 4),
                new Surgery(5, 6, 2)
            ];
            this.surgeries[0].pair = this.surgeries[1];
            this.surgeries[1].pair = this.surgeries[0];


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
                this.updateUI(true);
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
                document.getElementById('score2').innerHTML = numOfRounds ? parseFloat(scores[1]).toFixed(2) : scores[1];
                document.getElementById('score3').innerHTML = numOfRounds ? parseFloat(scores[2]).toFixed(2) : scores[2];
                document.getElementById('totalScore').innerHTML = numOfRounds ? parseFloat(total).toFixed(2) : total;
            }

            this.surgeries.forEach((s, i) => {
                document.getElementById('black' + i).innerHTML = s.numOfHealedBlackRats;
                document.getElementById('white' + i).innerHTML = s.numOfHealedWhiteRats;
                document.getElementById('infection' + i).innerHTML = s.numOfInfections;
            });

            document.getElementById('step').disabled = !doContinue || this.speed;
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
                    const report = {
                        ratsInTheHall: this.hall.rats.map(rat => rat ? {
                            remainingTime: rat.triage,
                            isBlack: rat.infected
                        } : null),
                        surgeriesOccupied: this.surgeries.map(surgery => !!surgery.rat)
                    };

                    const result = this.erManager.redirectRatToSurgery(report);

                    if (result
                        && result.rat >= 0 && result.rat <= 4
                        && result.surgery >= 0 && result.surgery <= 2) {

                        log(`Redirecting rat #${result.rat} to surgery #${result.surgery}`);

                        // UPDATES

                        this.hall.update();
                        this.surgeries.forEach(surgery => surgery.update());

                        // HALL -> SURGERY
                        {
                            const ratIndex = result.rat;
                            const surgery = this.surgeries[result.surgery];

                            if (!this.hall.hasRat(ratIndex)) {
                                log(`No rat is sitting at position #${result.rat}!`);
                            } else if (surgery.isFull()) {
                                log(`Surgery #${result.surgery} is full!`);
                            } else {
                                const rat = this.hall.pickRat(ratIndex);
                                surgery.pushRat(rat);
                            }
                        }

                        // STREET -> HALL

                        {
                            if (this.street.isEmpty()) {
                                log(`No more rat in the street!`);
                            } else if (this.hall.isFull()) {
                                log(`Hall is full!`);
                            } else {
                                const rat = this.street.pickRat();
                                this.hall.pushRat(rat);
                            }
                        }

                        this.hall.updateSigns();

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
                        console.error('Not a valid response!', result);
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





