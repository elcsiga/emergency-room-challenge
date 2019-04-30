

(ParkingManager => {

	let SILENT_MODE = false;
	
    const CAR_WIDTH = parseInt(getComputedStyle(document.body).getPropertyValue('--car-width'));
    const CAR_HEIGHT = parseInt(getComputedStyle(document.body).getPropertyValue('--car-height'));

    const CAR = {
        MANAGER: 'manager',
        EMPLOYEE: 'employee',
        DISABLED: 'disabled'
    };

    const PARKINGLOT = {
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

    class Car {
        constructor(type, index) {
            this.type = type;
            this.index = index;
			if (!SILENT_MODE) {
				this.img = document.createElement("img");
				this.img.src = `game/cars/${type}.png`;
				document.getElementById('board').appendChild(this.img);
			}
        }
        setPos(pos) {
			if (this.img) {
				this.img.style.transform = `translate(${pos.x*CAR_WIDTH}px, ${pos.y*CAR_HEIGHT + 10}px)`;
			}
            return this;
        }
        setOpacity(opacity) {
			if (this.img) {
				this.img.style.opacity = opacity;
			}
            return this;
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
            const carTypes = new Array(100);
            carTypes.fill(CAR.MANAGER, 0, 20);
            carTypes.fill(CAR.EMPLOYEE, 20, 70);
            carTypes.fill(CAR.DISABLED, 70, 100);

            this.cars = carTypes
                .shuffle()
                .map((type, index) => new Car(type, index));

            this.update();
        }
        update() {
            this.cars.forEach(( car, index ) => car
                .setPos({x: -index+11, y: 5})
                .setOpacity( Math.max(0, 1 - index/10) )
            );
        }
        pickFirstCar() {
            const car = this.cars.shift();
            this.update();
            return car;
        }
        destroy() {
            this.cars.forEach( car => car.destroy() );
        }
    }

    class ParkingLot {
        constructor( capacity, positionStrategy ) {
            this.cars = [];
            this.capacity = capacity;
            this.positionStrategy = positionStrategy;
        }

        pushCar(car) {
            const nextIndex = this.cars.length;
            if (nextIndex < this.capacity) {
                const nextPos = this.positionStrategy(nextIndex);
                this.cars.push( car.setPos(nextPos) );
                return true;
            }
            else {
                return false;
            }
        }
        getFreeCapacity() {
            return this.capacity - this.cars.length;
        }
        destroy() {
            this.cars.forEach( car => car.destroy() );
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
                () => this.parkingLots[PARKINGLOT.UNDERGROUND_GARAGE].cars
                    .reduce((sum, car, position) => sum + (car.type === CAR.MANAGER && position >= 20 ? 10 : 0), 0),
                () => this.parkingLots[PARKINGLOT.RENO_COURT].cars
                        .reduce((sum, car, position) => sum + (car.type === CAR.DISABLED ? Math.max(10 - position, 0) : 0), 0)
                    + this.parkingLots[PARKINGLOT.OPEN_AREA].cars
                        .reduce((sum, car, position) => sum + (car.type === CAR.DISABLED ? Math.max(10 - position, 0) : 0), 0),
                () => this.parkingLots[PARKINGLOT.UNDERGROUND_GARAGE].cars
                        .reduce((sum, car) => sum + (car.type === CAR.EMPLOYEE ? 2 : 0), 0)
                    + this.parkingLots[PARKINGLOT.RENO_COURT].cars
                        .reduce((sum, car) => sum + (car.type === CAR.EMPLOYEE ? 2 : 0), 0)
                    + this.parkingLots[PARKINGLOT.OPEN_AREA].cars
                        .reduce((sum, car) => sum + (car.type === CAR.EMPLOYEE ? 2 : 0), 0)
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
            this.updateUI();
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

            const streetHasCars = this.street.cars.length > 0;
            document.getElementById('slow-run').disabled = !streetHasCars;
            document.getElementById('fast-run').disabled = !streetHasCars;
            document.getElementById('instant-run').disabled = !streetHasCars;
            document.getElementById('pause').disabled = !streetHasCars || this.speed === undefined;
            document.getElementById('reset').disabled = this.street.cars.length === 100;
        }
        reset() {
            if (this.street)
                this.street.destroy();
            if (this.parkingLots) {
                for (let parkingLotId in this.parkingLots) {
                    this.parkingLots[parkingLotId].destroy();
                }
            }

            this.street = new Street();
            try {
                this.parkingManager = new ParkingManager();
            } catch (e) {
                console.error('Cannot create new ParkingManager', e);
            }

            this.parkingLots = {
                [PARKINGLOT.UNDERGROUND_GARAGE]:
                    new ParkingLot( 30, (index) => ({
                        x: index % 10 + 1,
                        y: 13 - Math.floor(index / 10)
                    }) ),
                [PARKINGLOT.RENO_COURT]:
                    new ParkingLot( 30, (index) => ({
                        x: Math.floor(index / 2) + 4,
                        y: index % 2 + 2
                    }) ),
                [PARKINGLOT.OPEN_AREA]:
                    new ParkingLot( 30, (index) => ({
                        x: index % 5 + 14 ,
                        y: Math.floor(index / 5) + 8
                    }) )
            };

            this.speed = undefined;
            this.updateUI([0,0,0]);
        }
        doAStep() {
            if ( SILENT_MODE || this.speed !== undefined) {
                const nextCar = this.street.pickFirstCar();
                if (nextCar) {
                    let parkingLotId;
                    try {
                        parkingLotId = this.parkingManager.selectParkingLot(nextCar.type);

                        if (parkingLotId && this.parkingLots.hasOwnProperty(parkingLotId)) {
                            if (this.parkingLots[parkingLotId].pushCar(nextCar)) {
                                // success
                            } else {
                                nextCar.destroy();
                            }
                            if (!SILENT_MODE && this.speed !== undefined) {
                                setTimeout(() => this.doAStep(), this.speed);
                            }
                        } else {
                            nextCar.destroy();
                            console.error(`'${parkingLotId}' is not a valid parking lot id`);
                            this.reset();
                        }

                    } catch (e) {
                        console.error('selectParkingLot() crashed.', e);
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

})(ParkingManager);





