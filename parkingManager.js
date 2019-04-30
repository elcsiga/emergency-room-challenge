/////////////////////////////////////////////////////////////////////////////
//
//  You have to write your version of the ParkingManager class
//  Write plain Javascript (ES6) code, do not use any framework or library.
//  Do not modify any other file
//
/////////////////////////////////////////////////////////////////////////////


class ParkingManager {

    //  For each game a new ParkingManager() object will be created.
    constructor() {
        console.log('Starting a new game...');
        this.index = 0;
    }

    //  selectParkingLot() will be called 100 times as the 100 car arrives.
    //  The function receives the type ot the car as a function parameter
    //  ('employee', 'disabled' or 'manager').
    //  You must send the car into one of the parking lots by returning a string
    //  ('underground-garage'. 'reno-court' or 'open-area').
    selectParkingLot(nextCar) {

        // As an example, here we select a random parking lot.
        // You can do it better...
        const parkingLotId = [
            'underground-garage',
            'reno-court',
            'open-area'
        ][Math.floor(Math.random() * 3)];

        console.log(`#${this.index} ${nextCar} -> ${parkingLotId}`);

        this.index ++;
        return parkingLotId;
    }
}

// makong ParkingManager class gobally accessible
window.ParkingManager = ParkingManager;


