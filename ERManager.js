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


    getNextRatId(freeMedTime, param) {
        let minMedTime = 100;
        let selectedRat = 0;
        for (let i = 0; i < param.length; ++i) {
            if (null === param[i]) {
                continue;
            }
            if (param[i].remainingTime < minMedTime && param[i].remainingTime >= freeMedTime) {
                minMedTime = param[i].remainingTime;
                selectedRat = i;
            }
        }
        return selectedRat;
    }

    getFirstFreeMed(param) {
        let result = 0;

        for (let freeMed = 0; freeMed < param.length; ++freeMed) {
            if (0 === param[freeMed]) {
                result = freeMed;
            }
        }
        return result;
    }

    cleanRatColor(param) {
        for (let j = 0; j < param.length; j++) {
            if (0 == param[j]) {
                this.ratColor[j] = null;
            }
        }
    }

    ratColor = [null, null, null];

    redirectRatToSurgery(report) {

        const medTime = [2, 3, 5];

        this.cleanRatColor(report.timeUntilSurgeryWillBeFree);

        let surgery = this.getFirstFreeMed(report.timeUntilSurgeryWillBeFree);

        const rat = this.getNextRatId(medTime[surgery], report.ratsInTheHall);

        if (report.ratsInTheHall[rat]) {
            this.ratColor[surgery] = report.ratsInTheHall[rat].isBlack;
        }

        return { rat, surgery };
    }
}

// making ERManager class globally accessible
window.ERManager = ERManager;
