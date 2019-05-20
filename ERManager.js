class ERManager {

    // For each game a new ERManager() object will be created.
    constructor() {
        console.log('Starting a new game...');

        // enable game logging
        window.logRats = false;

        // list for tracking rats by room
        this.ratsByRoom = [null, null, null];

        // list of scoring strategies
        this.scoringStrategies = [
            {
                description: 'Priority by logarithmic remaining time (result in a greedy redirection)',
                execute: context => context.score + Math.log10(11) - Math.log10(context.rat.remainingTime)
            },
            {
                description: 'Avoid infections on the first floor',
                execute: context => {
                    let score = context.score;
                    if (context.surgeryIndex < 2) {
                        const oppositeIndex = 0 | !context.surgeryIndex;
                        if (this.ratsByRoom[oppositeIndex] === null || this.ratsByRoom[oppositeIndex].isBlack === context.rat.isBlack) {
                            // boost score if the same color rats can be put on the first floor
                            score += Math.log10(3);
                        } else {
                            // otherwise the rat will remain in the hall
                            score = 0.0;
                        }
                    }
                    return score;
                }
            }
        ];
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
        this.cleanupHealedRatsFromRoomTracking(report.timeUntilSurgeryWillBeFree);
        let maxScore = 0.0;
        let redirectionResponse = null;
        let ratToHeal = null;
        report.ratsInTheHall.forEach((rat, ratIndex) =>
            report.timeUntilSurgeryWillBeFree.forEach((free, surgeryIndex) => {
                // create initial context for scoring strategies
                const context = { rat: rat, surgeryIndex: surgeryIndex, score: 0.0 };
                // handle cases when rat is on a position and surgery is free in the next step
                if (rat !== null && free <= 1) {
                    this.scoringStrategies.forEach(strategy => context.score = strategy.execute(context));
                }
                // select the maximum score calculated by strategies
                if (context.score > maxScore) {
                    maxScore = context.score;
                    redirectionResponse = { rat: ratIndex, surgery: surgeryIndex };
                    ratToHeal = rat;
                }
            })
        );
        // track the redirection of rats
        if (redirectionResponse !== null) {
            this.ratsByRoom[redirectionResponse.surgery] = ratToHeal;
        }
        // returns with redirection if it could be determined, otherwise do not redirect
        return redirectionResponse || this.noRedirectionResponse(report);
    }

    /**
     * Creates a response which does not redirect any rats to any surgery.
     * @param {Object} report the report
     * @return {Object} the redirection response
     */
    noRedirectionResponse(report) {
        let noRedirectionResponse = null;
        report.ratsInTheHall.forEach((rat, ratIndex) =>
            report.timeUntilSurgeryWillBeFree.forEach((free, surgeryIndex) => {
                if (noRedirectionResponse === null && (free > 1 || rat === null)) {
                    noRedirectionResponse = { rat: ratIndex, surgery: surgeryIndex };
                }
            })
        );
        return noRedirectionResponse;
    }

    /**
     * Cleanup rats from rats by room tracking.
     * @param {array} timeUntilSurgeryWillBeFree the array of room availability
     */
    cleanupHealedRatsFromRoomTracking(timeUntilSurgeryWillBeFree) {
        timeUntilSurgeryWillBeFree.forEach((free, surgeryIndex) => {
            if (free <= 1) {
                this.ratsByRoom[surgeryIndex] = null;
            }
        });
    }
}

// making ERManager class globally accessible
window.ERManager = ERManager;
