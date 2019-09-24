class AlienAI {
    playOutTurn(ship, tokenController, tokenContainer) {
        
    }
}

class GreenThingAlienAI extends AlienAI {
    playOutTurn(ship, tokenController, tokenContainer) {
        this.upgradeUnits(ship, tokenController, tokenContainer);
        this.moveUnits(tokenController);
        this.doAlienAttacks(ship, tokenController);
    }

    // phase 1
    upgradeUnits(ship, tokenController, tokenContainer) {
        const numAliens = tokenController.alienTokens.length;

        const alienCounts = {};
        for (let i = 0; i < numAliens; i++) {
            const alien = tokenController.alienTokens[i];
            alienCounts[alien.alienType] = alienCounts[alien.alienType] || 0;
            alienCounts[alien.alienType] += 1;
        }

        let maxCount = 0;
        let maxType = null;
        Object.keys(alienCounts).forEach((type) => {
            const count = alienCounts[type] + Math.random() * 2;
            if (count > maxCount) {
                maxCount = count;
                maxType = type;
            }
        });

        if (!maxType) { return; }

        const alienType = maxType;

        for (let i = 0; i < numAliens; i++) {
            const alien = tokenController.alienTokens[i];
            if (alien.room && alien.alienType === alienType) {
                if (alienType === Alien.ALIEN_TYPES.ADULT) {
                    const newAlien = new Alien(alien.gamestate, Alien.ALIEN_TYPES.EGG, alien.room, tokenContainer);
                    newAlien.setVisible(false);
                    tokenController.addToken(newAlien, ship);
                    alien.playAnimation(Token.ANIMATIONS.spawn, { newToken: newAlien });
                } else {
                    alien.upgrade();
                }
            }
        };
    }

    // phase 2
    moveUnits(tokenController) {
        const numAliens = tokenController.alienTokens.length;
        for (let i = 0; i < numAliens; i++) {
            const alien = tokenController.alienTokens[i];
            const previousMoves = [alien.room];
            for (let move = 0; move < alien.movesLeft; move++) {
                const nextStep = this.moveAlien(alien, previousMoves);
                if (!nextStep) { break; }
                previousMoves.push(nextStep);
                if (previousMoves[previousMoves.length - 1].playerTokens.length > 0) {
                    break;
                }
            }
            for (let i = 1; i < previousMoves.length; i++) {
                alien.moveToRoom(previousMoves[i]);
            }
        }
    }

    moveAlien(alien, previousMoves) {
        if (alien.room.playerTokenCount > 0) {
            return;
        }

        let targetRooms = [];
        let currPriority = this.getRoomPriority(alien, alien.room);
        previousMoves[previousMoves.length - 1].getAdjacentRooms().forEach((room) => {
            if (previousMoves.indexOf(room) !== -1) { return; }

            let roomPriority = this.getRoomPriority(alien, room);
            if (currPriority === undefined || roomPriority > currPriority) {
                targetRooms = [room];
                currPriority = roomPriority;
            } else if (roomPriority === currPriority) {
                targetRooms.push(room);
            }
        });

        if (targetRooms) {
            return targetRooms[Math.floor(Math.random() * targetRooms.length)];
        }
        return null;
    }

    getRoomPriority(alien, room) {
        return -room.alienTokenCount - room.playerTokenCount;
    }

    doAlienAttacks(ship, tokenController) {
        ship.rooms.forEach((room) => {
            if (room.alienTokens.length === 0 || room.playerTokens.length === 0) {
                return;
            }
            let attackLeft = room.alienTokens.reduce((currVal, alien) => {
                if (alien.attackValue) {
                    return currVal + alien.attackValue;
                }
                return currVal;
            }, 0);
            let alienAttacker = 0;
            let sortedTokens = room.playerTokens.sort((token) => { return token.health; });
            let attackedTokens = [];
            for (let i = 0; i < sortedTokens.length; i++) {
                if (attackLeft >= sortedTokens[i].health) {
                    while (
                        alienAttacker < room.alienTokens.length && 
                        attackLeft > sortedTokens[i].health &&
                        sortedTokens[i].health > 0
                    ) {
                        room.alienTokens[alienAttacker].attackTarget(sortedTokens[i]);
                        attackLeft -= room.alienTokens[alienAttacker].attackValue;
                        alienAttacker += 1;
                    }
                    attackedTokens.push(sortedTokens[i]);
                }
            }
            attackedTokens.forEach((token) => {
                if (!token.isAlive()) {
                    token.destroy(tokenController);
                }
            })
        });
    }
}