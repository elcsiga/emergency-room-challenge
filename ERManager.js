/////////////////////////////////////////////////////////////////////////////
//
//  You have to write your version of the ERManager class
//  Write plain Javascript (ES6) code, do not use any framework or library.
//  Do not modify any other file
//
/////////////////////////////////////////////////////////////////////////////


class ERManager {

    constructor() {
        console.log('Starting a new game...');
        window.logRats = true;

        this.roomTimes = null;
        this.roomA = null;
        this.roomB = null;
        this.roomC = null;
        this.roomAOpen = true;
        this.roomBOpen = true;
        this.roomCOpen = true;

        this.chosenMouseIdx = 0;
        this.chosenRoomIdx = 0;

        this.healedBlackMouseNum = 0;
        this.healedWhiteMouseNum = 0;

        this.blackMouseInRoomA = false;
        this.blackMouseInRoomB = false;

        this.tryNextOne = false;
    }

    redirectRatToSurgery(report) {
        this.initializeVariables(report);

        const waitingRoom = report.ratsInTheHall
        .map((currentValue, index) => {
            if(currentValue !== null) {
                currentValue.index = index;
            }
            return currentValue;
        })
        .filter(m => this.notEmptyOrDead(m))
        .sort((a, b) => {
            let value = a.remainingTime - b.remainingTime;
            if(value !== 0) {
                return value;
            } else {
                return a.isBlack ? this.healedBlackMouseNum : this.healedWhiteMouseNum - b.isBlack ? this.healedBlackMouseNum : this.healedWhiteMouseNum;
            }
        });

        if(waitingRoom.length === 0 || (!this.roomAOpen && !this.roomBOpen && !this.roomCOpen)) {
            this.chosenMouseIdx = 0;
            this.chosenRoomIdx = 2;
        } else if(waitingRoom.length === 1) {
            this.selectRoomForOnePatient(waitingRoom[0]);
        } else if(waitingRoom.length === 2) {
            this.selectRoomForTwoPatients(waitingRoom);
        } else if(waitingRoom.length === 3) {
            this.selectRoomForThreePatients(waitingRoom);
        } else if(waitingRoom.length === 4) {
            this.selectRoomForFourPatients(waitingRoom);
        } else {
            this.selectRoomForFivePatients(waitingRoom);
        }

        let selectedRoom = this.roomTimes[this.chosenRoomIdx];
        if(selectedRoom <= 1 && waitingRoom.length !== 0) {
            let selectedMouse = waitingRoom.filter(m => m.index === this.chosenMouseIdx);
            this.increaseHealCounter(selectedMouse[0]);
        }

        let rat = this.chosenMouseIdx;
        let surgery = this.chosenRoomIdx;

        return { rat, surgery };
    }

    notEmptyOrDead(mouse) {
        if(mouse === null) {
            return false;
        }

        let mouseTTL = mouse.remainingTime;

        if(mouseTTL >= this.roomC) {
            return true;
        } else if(mouseTTL >= this.roomA && mouseTTL >= this.roomB) {
            return true;
        } else if(mouseTTL >= this.roomA && (mouse.isBlack === this.blackMouseInRoomB || mouseTTL === this.roomB)) {
            return true;
        } else if(mouseTTL > this.roomB && (mouse.isBlack === this.blackMouseInRoomA || mouseTTL === this.roomA)) {
            return true;
        } else {
            return false;
        }
    };

    selectRoomForOnePatient(onlyMouse) {
        let mouseTTL = onlyMouse.remainingTime;

        // if only one room is available
        if(this.roomAOpen && onlyMouse.isBlack === this.blackMouseInRoomB && !this.roomBOpen && !this.roomCOpen) {
            this.chooseRoom(0, onlyMouse);
            this.tryNextOne = false;
        } else if(!this.roomAOpen && this.roomBOpen && onlyMouse.isBlack === this.blackMouseInRoomA && !this.roomCOpen) {
            this.chooseRoom(1, onlyMouse);
            this.tryNextOne = false;
        } else if(!this.roomAOpen && !this.roomBOpen && this.roomCOpen && mouseTTL < 3) {
            this.chooseRoom(2, onlyMouse);
            this.tryNextOne = false;

            // else try to put it in one
        } else if(this.roomAOpen && (this.roomBOpen || onlyMouse.isBlack === this.blackMouseInRoomB)) {
            this.chooseRoom(0, onlyMouse);
            this.tryNextOne = false;
        } else if(this.roomBOpen && (this.roomAOpen || onlyMouse.isBlack === this.blackMouseInRoomA)) {
            this.chooseRoom(1, onlyMouse);
            this.tryNextOne = false;
        } else if(this.roomCOpen && mouseTTL < 2) {
            this.chooseRoom(2, onlyMouse);
            this.tryNextOne = false;
        } else {
            this.tryNextOne = true;
            this.chooseRoom(2, onlyMouse);
        }
    };

    selectRoomForTwoPatients(waitingRoom) {
        let mouse1 = waitingRoom[0];
        let mouse2 = waitingRoom[1];

        if(mouse1.isBlack === mouse2.isBlack) {
            this.selectRoomForOnePatient(mouse1);
        } else if(this.isPriorOrEquals(mouse1, mouse2)) {
            if(this.priorDiff(mouse1) > 1 || (mouse2.remainingTime - mouse1.remainingTime) > 2) {
                this.selectRoomForOnePatient(mouse1);
                if(this.tryNextOne) {
                    this.selectRoomForOnePatient(mouse2);
                }
            } else if(this.isPrior(mouse1, mouse2) || (mouse2.remainingTime - mouse1.remainingTime) > 1) {
                if(this.canGoToRoomA(mouse1)) {
                    this.chooseRoom(0, mouse1);
                } else if(this.canGoToRoomB(mouse1)) {
                    this.chooseRoom(1, mouse1);
                } else if(this.canGoToRoomA(mouse2)) {
                    this.chooseRoom(0, mouse2);
                }   else if(this.canGoToRoomB(mouse2)) {
                    this.chooseRoom(1, mouse2);
                } else {
                    this.selectRoomForOnePatient(mouse1);
                    if(this.tryNextOne) {
                        this.selectRoomForOnePatient(mouse2);
                    }
                }
            } else {
                if(this.canGoToRoomA(mouse1)) {
                    this.chooseRoom(0, mouse1);
                } else if(this.canGoToRoomA(mouse2)) {
                    this.chooseRoom(0, mouse2);
                } else if(this.canGoToRoomB(mouse1)) {
                    this.chooseRoom(1, mouse1);
                }  else if(this.canGoToRoomB(mouse2)) {
                    this.chooseRoom(1, mouse2);
                } else {
                    this.selectRoomForOnePatient(mouse1);
                    if(this.tryNextOne) {
                        this.selectRoomForOnePatient(mouse2);
                    }
                }
            }
        } else {
            if((mouse2.remainingTime - mouse1.remainingTime) > 2) {
                if(this.priorDiff(mouse2) > 3) {
                    if(this.canGoToRoomA(mouse2)) {
                        this.chooseRoom(0, mouse2);
                    } else if(this.canGoToRoomB(mouse2)) {
                        this.chooseRoom(1, mouse2);
                    } else if(this.canGoToRoomA(mouse1)) {
                        this.chooseRoom(0, mouse1);
                    } else if(this.canGoToRoomB(mouse1)) {
                        this.chooseRoom(1, mouse1);
                    } else {
                        this.selectRoomForOnePatient(mouse2);
                        if(this.tryNextOne) {
                            this.selectRoomForOnePatient(mouse1);
                        }
                    }
                } else if(this.priorDiff(mouse2) > 2) {
                    if(this.canGoToRoomA(mouse1)) {
                        this.chooseRoom(0, mouse1);
                    } else if(this.canGoToRoomA(mouse2)) {
                        this.chooseRoom(0, mouse2);
                    } else if(this.canGoToRoomB(mouse1)) {
                        this.chooseRoom(1, mouse1);
                    } else if(this.canGoToRoomB(mouse2)) {
                        this.chooseRoom(1, mouse2);
                    } else {
                        this.selectRoomForOnePatient(mouse1);
                        if(this.tryNextOne) {
                            this.selectRoomForOnePatient(mouse2);
                        }
                    }
                } else if(this.priorDiff(mouse2) > 1) {
                    if(this.canGoToRoomA(mouse1)) {
                        this.chooseRoom(0, mouse1);
                    } else if(this.canGoToRoomA(mouse2)) {
                        this.chooseRoom(0, mouse2);
                    } else if(this.canGoToRoomB(mouse1)) {
                        this.chooseRoom(1, mouse1);
                    } else if(this.canGoToRoomB(mouse2)) {
                        this.chooseRoom(1, mouse2);
                    } else {
                        this.selectRoomForOnePatient(mouse1);
                        if(this.tryNextOne) {
                            this.selectRoomForOnePatient(mouse2);
                        }
                    }
                } else {
                    if(this.canGoToRoomA(mouse1)) {
                        this.chooseRoom(0, mouse1);
                    } else if(this.canGoToRoomB(mouse1)) {
                        this.chooseRoom(1, mouse1);
                    } else if(this.canGoToRoomA(mouse2)) {
                        this.chooseRoom(0, mouse2);
                    } else if(this.canGoToRoomB(mouse2)) {
                        this.chooseRoom(1, mouse2);
                    } else {
                        this.selectRoomForOnePatient(mouse1);
                        if(this.tryNextOne) {
                            this.selectRoomForOnePatient(mouse2);
                        }
                    }
                }
            } else if((mouse2.remainingTime - mouse1.remainingTime) > 1) {
                if(this.priorDiff(mouse2) > 3) {
                    this.selectRoomForOnePatient(mouse2);
                    if(this.tryNextOne) {
                        this.selectRoomForOnePatient(mouse1);
                    }
                } else if(this.priorDiff(mouse2) > 2) {
                    if(this.canGoToRoomA(mouse2)) {
                        this.chooseRoom(0, mouse2);
                    } else if(this.canGoToRoomB(mouse2)) {
                        this.chooseRoom(1, mouse2);
                    } else if(this.canGoToRoomA(mouse1)) {
                        this.chooseRoom(0, mouse1);
                    } else if(this.canGoToRoomB(mouse1)) {
                        this.chooseRoom(1, mouse1);
                    } else {
                        this.selectRoomForOnePatient(mouse2);
                        if(this.tryNextOne) {
                            this.selectRoomForOnePatient(mouse1);
                        }
                    }
                } else if(this.priorDiff(mouse2) > 1) {
                    if(this.canGoToRoomA(mouse1)) {
                        this.chooseRoom(0, mouse1);
                    } else if(this.canGoToRoomA(mouse2)) {
                        this.chooseRoom(0, mouse2);
                    } else if(this.canGoToRoomB(mouse1)) {
                        this.chooseRoom(1, mouse1);
                    } else if(this.canGoToRoomB(mouse2)) {
                        this.chooseRoom(1, mouse2);
                    } else {
                        this.selectRoomForOnePatient(mouse1);
                        if(this.tryNextOne) {
                            this.selectRoomForOnePatient(mouse2);
                        }
                    }
                } else {
                    if(this.canGoToRoomA(mouse1)) {
                        this.chooseRoom(0, mouse1);
                    } else if(this.canGoToRoomB(mouse1)) {
                        this.chooseRoom(1, mouse1);
                    } else if(this.canGoToRoomA(mouse2)) {
                        this.chooseRoom(0, mouse2);
                    } else if(this.canGoToRoomB(mouse2)) {
                        this.chooseRoom(1, mouse2);
                    } else {
                        this.selectRoomForOnePatient(mouse1);
                        if(this.tryNextOne) {
                            this.selectRoomForOnePatient(mouse2);
                        }
                    }
                }
            } else {
                if(this.canGoToRoomA(mouse2)) {
                    this.chooseRoom(0, mouse2);
                } else if(this.canGoToRoomA(mouse1)) {
                    this.chooseRoom(0, mouse1);
                } else if(this.canGoToRoomB(mouse2)) {
                    this.chooseRoom(1, mouse2);
                }  else if(this.canGoToRoomB(mouse1)) {
                    this.chooseRoom(1, mouse1);
                } else {
                    this.chooseRoom(2, mouse1);
                }
            }
        }
    };

    selectRoomForThreePatients(waitingRoom) {
        if(waitingRoom[0].isBlack === waitingRoom[1].isBlack && waitingRoom[0].isBlack !== waitingRoom[2].isBlack) {
            this.selectRoomForTwoPatients([waitingRoom[0], waitingRoom[2]]);
        } else {
            this.selectRoomForTwoPatients([waitingRoom[0], waitingRoom[1]]);
        }
    }

    selectRoomForFourPatients(waitingRoom) {
        if(waitingRoom[0].isBlack === waitingRoom[1].isBlack && waitingRoom[0].isBlack === waitingRoom[2].isBlack && waitingRoom[0].isBlack !== waitingRoom[3].isBlack) {
            this.selectRoomForThreePatients([waitingRoom[0], waitingRoom[1], waitingRoom[3]]);
        } else {
            this.selectRoomForThreePatients([waitingRoom[0], waitingRoom[1], waitingRoom[2]]);
        }
    }

    selectRoomForFivePatients(waitingRoom) {
        if(waitingRoom[0].isBlack === waitingRoom[1].isBlack && waitingRoom[0].isBlack === waitingRoom[2].isBlack && waitingRoom[0].isBlack === waitingRoom[3].isBlack && waitingRoom[0].isBlack !== waitingRoom[4].isBlack) {
            this.selectRoomForFourPatients([waitingRoom[0], waitingRoom[1], waitingRoom[2], waitingRoom[4]]);
        } else {
            this.selectRoomForFourPatients([waitingRoom[0], waitingRoom[1], waitingRoom[2], waitingRoom[3]]);
        }
    }

    chooseRoom(roomNumber, chosenMouse) {
        this.chosenRoomIdx = roomNumber;
        this.chosenMouseIdx = chosenMouse.index;

        if(roomNumber === 0 && this.roomAOpen) {
            this.blackMouseInRoomA = chosenMouse.isBlack;
        } else if(roomNumber === 1 && this.roomBOpen) {
            this.blackMouseInRoomB = chosenMouse.isBlack;
        }
    };

    increaseHealCounter(selectedMouse) {
        if(selectedMouse.isBlack) {
            this.healedBlackMouseNum++;
        } else {
            this.healedWhiteMouseNum++;
        }
    };

    initializeVariables(report) {
        this.roomTimes = report.timeUntilSurgeryWillBeFree;
        this.roomA = this.roomTimes[0];
        this.roomB = this.roomTimes[1];
        this.roomC = this.roomTimes[2];
        this.roomAOpen = this.roomA <= 1;
        this.roomBOpen = this.roomB <= 1;
        this.roomCOpen = this.roomC <= 1;
    };

    canGoToRoomA(mouse) {
        return this.roomAOpen && (this.roomBOpen || mouse.isBlack === this.blackMouseInRoomB);
    }

    canGoToRoomB(mouse) {
        return this.roomBOpen && (this.roomAOpen || mouse.isBlack === this.blackMouseInRoomA);
    }

    isPrior(mouse1, mouse2) {
        let priority1 = mouse1.isBlack ? this.healedWhiteMouseNum : this.healedBlackMouseNum;
        let priority2 = mouse2.isBlack ? this.healedWhiteMouseNum : this.healedBlackMouseNum;

        return (priority1 - priority2) > 0;
    }

    isPriorOrEquals(mouse1, mouse2) {
        let priority1 = mouse1.isBlack ? this.healedWhiteMouseNum : this.healedBlackMouseNum;
        let priority2 = mouse2.isBlack ? this.healedWhiteMouseNum : this.healedBlackMouseNum;

        return (priority1 - priority2) >= 0;
    }

    priorDiff(mouse1) {
        let priority1 = mouse1.isBlack ? this.healedWhiteMouseNum : this.healedBlackMouseNum;
        let priority2 = mouse1.isBlack ? this.healedBlackMouseNum : this.healedWhiteMouseNum;

        return priority1 - priority2;
    }
}

// making ERManager class globally accessible
window.ERManager = ERManager;