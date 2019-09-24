class PlayerToken extends Token {
    constructor (gamestate, room, stage) {
        super(gamestate, 'player_basic', room, stage);
        this.movesPerTurn = 1;
        this.attacksPerTurn = 1;
        this.damage = 2
        this.maxHealth = 3;
        this.health = this.maxHealth;

        this.itemsCarried = [];
    }

    updateState() {
        super.updateState();
        if (
            (this.movesLeft <= 0 && this.gamestate.getPhase() == GameState.GAME_PHASES.MOVE) ||
            (this.attacksLeft <= 0 && this.gamestate.getPhase() == GameState.GAME_PHASES.ATTACK)
        ) {
            this.detailsSprite.setRotation(Math.PI / 2);
        } else {
            this.detailsSprite.setRotation(0);
        }
    }

    doMoveAction(room) {
        if (room === this.room) { return; }
        if (this.movesLeft <= 0) { return; }
        if (room.alienTokens.length > 0) {
            this.movesLeft = 0;
        } else {
            this.movesLeft -= 1;
        }
        this.moveToRoom(room);
        this.updateState();
    }

    attackTarget(targetToken) {
        if (this.attacksLeft <= 0) { return; }
        this.attacksLeft -= 1;
        if (this.itemsCarried.length) {
            this.itemsCarried[0].attackTarget(targetToken);
            if (!this.itemsCarried[0].isAlive()) {
                this.itemsCarried[0].respawn();
                this.itemsCarried.splice(0, 1);
            }
        } else {
            targetToken.health -= this.damage;
        }
        this.updateState();
    }

    canInteractWithItem(itemToken) {
        return this.movesLeft === this.movesPerTurn && this.itemsCarried.length === 0;
    }

    interactWithItem(itemToken) {
        this.itemsCarried.push(itemToken);
        itemToken.getPickedUpBy(this);
        this.playAnimation(Token.ANIMATIONS.pickUpItem, { itemToken, startX: itemToken.roomSprite.x, startY: itemToken.roomSprite.y });
    }

    isPlayerToken() {
        return true;
    }

    isAlive() {
        return this.health > 0;
    }
}