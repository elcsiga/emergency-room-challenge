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

        // enable game logging
        window.logRats = true;
    }

    //  redirectRatToSurgery() will be called repetitively until there are rats in the hall.
    //  The function receives a report about the current state of things like this:
    //  {
    //    ratsInTheHall: [
    //      {remainingTime: 5, isBlack: false},   // remainingTime will decrease in each step
    //      {remainingTime: 10, isBlack: false},
    //      {remainingTime: 5, isBlack: true},
    //      null,                                 // no rat on this position
    //      {remainingTime: 1, isBlack: false}
    //    ],
    //    timeUntilSurgeryWillBeFree: [ 0, 2, 1 ] // for A,B and C surgery rooms,
    //                                            // 0 means that the room is empty
    //  }
    //
    //  You have to return with an object, which redirects one rat into one surgery room
    //  { rat: 2, surgery: 0 }  // rat: 0..4, surgery: 0-2
    //
    //  You MUST always return a valid response. If there is no rat in the given
    //  position or the given surgery room is occupied, the rat will remain in the hall.

    redirectRatToSurgery(report) {

        // As an example, here we send a random rat to a random Surgery:
        // You can do it better...

        const rat = Math.floor(Math.random() * 5);
        const surgery = Math.floor(Math.random() * 3);
        return { rat, surgery };
    }
}

// making ERManager class globally accessible
window.ERManager = ERManager;
