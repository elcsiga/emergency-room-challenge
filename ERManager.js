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
        //console.log('Starting a new game...');

        // enable game logging
        //window.logRats = true;
		window.isBlackA = false;
		window.isBlackB = false;
		window.TreatedWhite = 0;
		window.TreatedBlack = 0;
		
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

		var i;
		
		var candidate = 1000;
		
		var waitingRats = [];
		var emptyChair = 1000;
		for(i=0;i<5;i++){
			if(report.ratsInTheHall[i] != null){
				waitingRats.push({index:i,rat:report.ratsInTheHall[i]});
			}
			else{
				emptyChair = i;
			}
		}
		
		waitingRats.sort(function(r1,r2){
			var v1 = r1.rat.remainingTime;
			var v2 = r2.rat.remainingTime;
			var discriminationfactor = 0.4*(TreatedBlack-TreatedWhite);
			if(r1.rat.isBlack){
				v1 = v1 + discriminationfactor;
			} else {
				v1 = v1 - discriminationfactor;
			}
			
			if(r2.rat.isBlack){
				v2 = v2 + discriminationfactor;
			} else {
				v2 = v2 - discriminationfactor;
			}

			return v1 - v2;
			
			});
		
		
		var found = false;
		var canInfect = false;
		var infectSurgery = 1000;
		for(i=0;i<waitingRats.length;i++){

		
			candidate = waitingRats[i].index;
		
			var freeSurgery = 1000;
			var j;
			for(j=0;j<3;j++){
				if(report.timeUntilSurgeryWillBeFree[j] < 2){
					
					
					if(
						(
							j==0 && report.timeUntilSurgeryWillBeFree[1] > 1 && isBlackB!=report.ratsInTheHall[candidate].isBlack
						)
							
						||
						
						(
							j==1&& report.timeUntilSurgeryWillBeFree[0] > 1 && isBlackA!=report.ratsInTheHall[candidate].isBlack
						)
					){
						// purposefully infect a white rat if we already treated more white and otherwise the black would die
						
						if( report.ratsInTheHall[candidate].isBlack&& (TreatedWhite-TreatedBlack) > 3 && report.ratsInTheHall[candidate].remainingTime < 2){
							canInfect = true;
							infectSurgery = j;
							break;
						}
						
						continue;
					}
						else {
						freeSurgery = j;
						found = true;
						break;
					}
				}
			}
			
			if(freeSurgery<3 || canInfect){

				break;
			}
		
		}
		
        var rat = Math.floor(Math.random() * 5);
        var surgery = Math.floor(Math.random() * 3);
        
		if(found){
			
			rat = candidate;
			surgery = freeSurgery;
			if(report.ratsInTheHall[rat].isBlack){
				TreatedBlack++;
			} else {
				TreatedWhite++;
			}
		} else if ( canInfect ){
			//console.log("Infecting a white rat purposefully");
			rat = candidate;
			surgery = infectSurgery;
			if(report.ratsInTheHall[rat].isBlack){
				TreatedBlack++;
			} else {
				TreatedWhite++;
			}
		} else if ( emptyChair < 5 ) {
			//Skip
			rat = emptyChair;
		} else {
			//random rat to occupied surgery
			surgery = 2;
					
		}
				
		if(surgery == 0 && report.ratsInTheHall[rat] != null){
				isBlackA = report.ratsInTheHall[rat].isBlack;
		}
		
		if(surgery == 1 && report.ratsInTheHall[rat] != null){
				isBlackB = report.ratsInTheHall[rat].isBlack;
		}
		
		return { rat, surgery };
    }
}

// making ERManager class globally accessible
window.ERManager = ERManager;
