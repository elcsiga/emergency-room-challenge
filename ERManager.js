/////////////////////////////////////////////////////////////////////////////
//
//  You have to write your version of the ERManager class
//  Write plain Javascript (ES6) code, do not use any framework or library.
//  Do not modify any other file
//
/////////////////////////////////////////////////////////////////////////////


class ERManager {

    //  For each game a new ParkingManager() object will be created.
    constructor() {
        console.log('Starting a new game...');
        this.index = 0;
    }

    //  selectRoom() will be called 100 times as the 100 rats arrives.
    //  The function receives the type ot the car as a function parameter
    //  ('employee', 'disabled' or 'manager').
    //  You must send the car into one of the parking lots by returning a string
    //  ('underground-garage'. 'reno-court' or 'open-area').
    selectRoom(nextRat) {

        // As an example, here we select a random parking lot.
        // You can do it better...
        const roomId = [
            'underground-garage',
            'reno-court',
            'open-area'
        ][Math.floor(Math.random() * 3)];

        console.log(`#${this.index} ${nextRat} -> ${roomId}`);

        this.index ++;
        return roomId;
    }
}

// makong ParkingManager class gobally accessible
window.ERManager = ERManager;


