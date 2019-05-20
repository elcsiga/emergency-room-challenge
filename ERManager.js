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
        window.logRats = false;
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

    ratsUnderHealing = [];

    redirectRatToSurgery(report) {
        // As an example, here we send a random rat to a random Surgery:
        // You can do it better...

        // const rat = Math.floor(Math.random() * 5);
        // const surgery = Math.floor(Math.random() * 3);
        var rats = report.ratsInTheHall;
        var surgeries = report.timeUntilSurgeryWillBeFree;

        //Convert rats to a more suitable format
        var mappedRats = rats.map((e, index) => this.mapRat(e, index));

        //Update ratsUnderHealing
        for (var i=0; i < surgeries.length; i++) {
            if (surgeries[i] == 0) {
                this.ratsUnderHealing[i] = null;
            }
        }

        return this.getResponse(mappedRats, surgeries);
    }

    getResponse(rats, surgeries) {
        var sortedRats = rats.filter(r => r.ttl !== null).sort((a,b) => this.sortRats(a.ttl, b.ttl))
        
        var possibleSurgeries = this.getPossibleSurgeries(surgeries);

        var selectedRat = -1;
        var selectedSurgery = -1;

        if (sortedRats.length > 0) {
            var mostUrgentRat = sortedRats.pop();
            while ((selectedRat == -1 && selectedSurgery == -1) && mostUrgentRat !== undefined) {   
                for (var i=0; i < possibleSurgeries.length; i++) {
                    var surgeryIndex = possibleSurgeries[i];
                    if (this.canBePlacedHere(surgeryIndex, mostUrgentRat, surgeries)) {
                        this.ratsUnderHealing[surgeryIndex] = mostUrgentRat;
                        selectedRat = mostUrgentRat.index;
                        selectedSurgery = surgeryIndex;
                        break;
                    }
                }

                if (selectedRat > -1 && selectedSurgery > -1)  break;
                mostUrgentRat = sortedRats.pop();
            }
        }

        if (selectedRat == -1 || selectedSurgery == -1) {
            selectedRat = 0;
            selectedSurgery = 0;
        }

        return {"rat": selectedRat , "surgery": selectedSurgery};
    }

    canBePlacedHere(surgeryIndex, rat, surgeries) {
        if (surgeryIndex == 2) return true;

        if (surgeryIndex == 0) {
            if (rat.isBlack) {
                return this.ratsUnderHealing[1] === null || this.ratsUnderHealing[1].isBlack;
            } else {
                return this.ratsUnderHealing[1] === null || !this.ratsUnderHealing[1].isBlack || this.cantWait(rat, surgeries);
            }
        } else {
            if (rat.isBlack) {
                return this.ratsUnderHealing[0] === null || this.ratsUnderHealing[0].isBlack;
            } else {
                return this.ratsUnderHealing[0] === null || !this.ratsUnderHealing[0].isBlack || this.cantWait(rat, surgeries);
            }
        }
    }

    cantWait(rat, surgeries) {
        return surgeries.filter(time => time > rat.ttl).length > 1;
    }

    getPossibleSurgeries(surgeries) {
        var candidates = [];

        for (var i=0; i < surgeries.length; i++) {
            if (surgeries[i] == 0) {
                candidates.push(i);
            }
        }

        return candidates;
    }

    sortRats(a,b) {
        return a - b;
    }

    mapRat(originalRat, index) {
        if (originalRat) {
            return {
                "index": index,
                "ttl": originalRat.remainingTime,
                "isBlack": originalRat.isBlack
            }
        } 

        return {
            "index": index,
            "ttl": null,
            "isBlack": null
        };
    }
}

// making ERManager class globally accessible
window.ERManager = ERManager;
