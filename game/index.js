

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

    Array.prototype.shuffle = function() {
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
				this.img.style.transform = `translate(${pos.x*RAT_WIDTH}px, ${pos.y*RAT_HEIGHT + 10}px)`;
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
			if (this.img) {
				document.getElementById('board').removeChild(this.img);
				this.img = null;
			}
        }
    }

    class Street {
        constructor() {
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
            this.rats.forEach(( rat, index ) => rat
                .setPos({x: -index+11, y: 5})
                .setOpacity( Math.max(0, 1 - index/10) )
            );
        }
        pickFirstRat() {
            const rat = this.rats.shift();
            this.update();
            return rat;
        }
        destroy() {
            this.rats.forEach( rat => rat.destroy() );
        }
    }

    class Hall {
        constructor() {
            this.capacity = 5;
            this.rats = new Array(this.capacity).fill(null);
            this.X = 1;
            this.Y = 1;
        }

        pushRat(rat) {
            const firstEmptyIndex = this.rats.findIndex(rat => rat === null);
            if (rat && firstEmptyIndex >= 0) {
                this.rats[firstEmptyIndex] = rat.setPos({x: this.X + firstEmptyIndex, y: this.Y});
            }
        }

        pickRat(index) {
            if (index > 0 && index < this.capacity) {
                const pickedRat = this.rats[index];
                this.rats[index] = null;
                return pickedRat;
            }
            else return null;
        }
        destroy() {
            this.rats.forEach( rat => rat.destroy() );
        }
    }

    class Room {
        constructor( capacity, X, Y ) {
            this.rats = [];
            this.capacity = capacity;
            this.X = X;
            this.Y = Y;
            this.numOfInfetcions = 0;
        }

        pushRat(rat) {
            const firstEmptyIndex = this.rats.findIndex(rat => rat === null);
            if (rat && firstEmptyIndex >= 0) {
                this.rats[firstEmptyIndex] = rat.setPos({x: this.X + firstEmptyIndex, y: this.Y});
            }
        }

        update() {
            // infecting
            const numOfInfetedRats = this.rats.reduce(( sum, rat ) => sum += (rat.infected ? 1 : 0));
            if (numOfInfetedRats > 0) {
                this.rats.forEach(rat => {
                    if (!rat.infected) {
                        rat.infected = true;
                        this.numOfInfetcions ++;
                    }
                });
            }

            // healing
            this.rats.forEach(( rat, index ) => {
                rat.heal();
                if (!rat.isIll()) {
                    this.rats[index] = null;
                    rat.destroy();
                }
            });
        }

        destroy() {
            this.rats.forEach( rat => rat.destroy() );
        }
    }

    class Game {
        constructor() {
            document.getElementById('slow-run').onclick = () => this.run(800);
            document.getElementById('fast-run').onclick = () => this.run(100);
            document.getElementById('instant-run').onclick = () => this.run(0);
            document.getElementById('pause').onclick = () => this.run(undefined);
            document.getElementById('reset').onclick = () => this.reset();
            document.getElementById('average').onclick = () => this.calculateAverage(1000);
			
            this.rules = [
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
            ];

            this.reset();
        }
		showProgress(label) {
			document.getElementById('progress').style.display = !!label ? 'block' : 'none';
			document.getElementById('progress').innerHTML = label;
			SILENT_MODE = !!label;
		}
		calculateAverage( numOfRounds ) {
			this.showProgress(`Calculating ${numOfRounds} rounds...`);
			setTimeout( () => {
				const sumScores = [0,0,0];
				for (let n = 0; n < numOfRounds; n++) {
					this.reset();
					for (let m = 0; m < 100; m++) {
						this.doAStep(true);
					}
					const scores = this.calculateScores();
					scores.forEach( (score, index) => sumScores[index] += score );
				}
				const averageScores = sumScores.map ( sum => sum / numOfRounds );
				this.showProgress(false);				
				this.updateUI(averageScores, numOfRounds);
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
			return this.rules.map( rule => rule());
		}
        updateUI(scores, numOfRounds) {
            const total = scores.reduce((sum, score) => sum + score, 0);
 
			document.getElementById('rounds').innerHTML = numOfRounds ? `(${numOfRounds} rounds)` : '';

            document.getElementById('score1').innerHTML = numOfRounds ? parseFloat(scores[0]).toFixed(2) : scores[0];
            document.getElementById('score2').innerHTML = numOfRounds ? parseFloat(scores[1]).toFixed(2) : scores[1];
            document.getElementById('score3').innerHTML = numOfRounds ? parseFloat(scores[2]).toFixed(2) : scores[2];
            document.getElementById('totalScore').innerHTML = numOfRounds ? parseFloat(total).toFixed(2) : total;

            const streetHasRats = this.street.rats.length > 0;
            document.getElementById('slow-run').disabled = !streetHasRats;
            document.getElementById('fast-run').disabled = !streetHasRats;
            document.getElementById('instant-run').disabled = !streetHasRats;
            document.getElementById('pause').disabled = !streetHasRats || this.speed === undefined;
            document.getElementById('reset').disabled = this.street.rats.length === 100;
        }
        reset() {
            if (this.street)
                this.street.destroy();
            if (this.rooms) {
                for (let roomId in this.rooms) {
                    this.rooms[roomId].destroy();
                }
            }

            this.street = new Street();
            try {
                this.erManager = new ERManager();
            } catch (e) {
                console.error('Cannot create new ERManager', e);
            }

            this.rooms = {
                [ROOM.UNDERGROUND_GARAGE]:
                    new Room( 30, (index) => ({
                        x: index % 10 + 1,
                        y: 13 - Math.floor(index / 10)
                    }) ),
                [ROOM.RENO_COURT]:
                    new Room( 30, (index) => ({
                        x: Math.floor(index / 2) + 4,
                        y: index % 2 + 2
                    }) ),
                [ROOM.OPEN_AREA]:
                    new Room( 30, (index) => ({
                        x: index % 5 + 14 ,
                        y: Math.floor(index / 5) + 8
                    }) )
            };

            this.speed = undefined;
            this.updateUI([0,0,0]);
        }
        doAStep() {
            if ( SILENT_MODE || this.speed !== undefined) {
                const nextRat = this.street.pickFirstRat();
                if (nextRat) {
                    let roomId;
                    try {
                        roomId = this.erManager.selectRoom(nextRat.type);

                        if (roomId && this.rooms.hasOwnProperty(roomId)) {
                            if (this.rooms[roomId].pushRat(nextRat)) {
                                // success
                            } else {
                                nextRat.destroy();
                            }
                            if (!SILENT_MODE && this.speed !== undefined) {
                                setTimeout(() => this.doAStep(), this.speed);
                            }
                        } else {
                            nextRat.destroy();
                            console.error(`'${roomId}' is not a valid parking lot id`);
                            this.reset();
                        }

                    } catch (e) {
                        console.error('selectRoom() crashed.', e);
                        this.reset();
                    }
					if (!SILENT_MODE) {
						this.updateUI( this.calculateScores() );
					}
                }
            }
        }
    }

    new Game();

})(ERManager);





