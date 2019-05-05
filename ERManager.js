/////////////////////////////////////////////////////////////////////////////
//
//  You have to write your version of the ERManager class
//  Write plain Javascript (ES6) code, do not use any framework or library.
//  Do not modify any other file
//
/////////////////////////////////////////////////////////////////////////////


class ERManager {

    //  For each game a new ERManager() object will be created.
    constructor() {
        console.log('Starting a new game...');
    }

    //  selectRoom() will be called repetitively until there are rats in the hall.
    //  The function receives an array which represents the rats sitting in the hall
    //  e.g.: ['', '', '']
    //  the first item represents the rat sitting on the chair 1, etc.
    //
    //  You must send ONE of the rats into ONE of the rooms by returning an object
    //  e.h.: { rat: 2, room: 3 }
    //  rat is the sit number the rat in the hall (
    //
    //  If you send a rat into a full room, the rat will remain in the hall
    //


    redirectRatToRoom(ratsInTheHall) {

        // As an example, here we send a random rat to a random room:
        // You can do it better...
        const rat = Math.floor(Math.random() * 5) + 1; // 1..5
        const room = Math.floor(Math.random() * 3) + 1; // 1..3

        return { rat, room };
    }
}

// making ERManager class globally accessible
window.ERManager = ERManager;


