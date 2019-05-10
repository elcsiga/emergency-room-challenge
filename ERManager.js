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
    //      {remainingTime: 5, isBlack: false},
    //      {remainingTime: 10, isBlack: false},
    //      {remainingTime: 5, isBlack: true},
    //      null,
    //      {remainingTime: 1, isBlack: false}
    //    ],
    //    surgeriesOccupied: [ true, true, false ]
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

        /*

        PRÓBAKÉPP: LEGSÜRGŐSEBB ESET A SZABAD SZOBÁBA
        EZ NEM LESZ BENNE A FELADATBAN

        let i = 0;
        let minT = 100;
        report.ratsInTheHall.forEach((rat, index) => {
            if (rat && rat.remainingTime < minT) {
                minT = rat.remainingTime;
                i = index;
            }
        });
        const s = report.surgeriesOccupied.findIndex(s => !s);
        return { rat: i, surgery: s < 0 ? 0 : s };

        */

    }
}

// making ERManager class globally accessible
window.ERManager = ERManager;
