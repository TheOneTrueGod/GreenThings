class Alien extends Token {
    constructor (gamestate, alienType, room, stage) {
        const alienDef = Alien.AlienDefs[alienType];
        super(gamestate, alienDef.sprite, room, stage);

        this.alienType = alienDef.type;
        this.movesPerTurn = alienDef.movesPerTurn;
        this.attacksPerTurn = alienDef.attacksPerTurn;
        this.health = alienDef.health;
        this.maxHealth = alienDef.health;
        this.attackValue = alienDef.attackValue;
    }

    upgrade() {
        const alienDef = Alien.AlienDefs[this.alienType];
        if (alienDef.upgradesTo) {
            const upgradedDef = Alien.AlienDefs[alienDef.upgradesTo];
            this.alienType = upgradedDef.type;
            this.movesPerTurn = upgradedDef.movesPerTurn;
            this.movesLeft = upgradedDef.movesPerTurn;

            this.attacksPerTurn = upgradedDef.attacksPerTurn;
            this.attacksLeft = upgradedDef.attacksPerTurn;
            this.attackValue = upgradedDef.attackValue;
            this.health = upgradedDef.health;
            this.maxHealth = upgradedDef.health;
            this.playAnimation(
                Token.ANIMATIONS.upgrade,
                { oldSprite: alienDef.sprite },
            );
        }
    }

    attackTarget(targetToken) {
        if (this.attacksLeft <= 0) { return; }
        this.attacksLeft -= 1;
        this.playAnimation(
          Token.ANIMATIONS.attack,
          {
            target: targetToken,
            position: this.roomSprite.position,
          }
        );
        this.updateState();
        targetToken.health -= this.attackValue;
    }

    isAlienToken() {
        return true;
    }

    isAlive() {
        return this.health > 0;
    }
}

Alien.ALIEN_TYPES = {
    ADULT: 'adult',
    YOUNG: 'young',
    FRAGMENT: 'fragment',
    EGG: 'egg',
};

Alien.AlienDefs = {
    [Alien.ALIEN_TYPES.ADULT]: { type: Alien.ALIEN_TYPES.ADULT, sprite: 'alien_adult', health: 5, movesPerTurn: 2, attacksPerTurn: 1, attackValue: 4 },
    [Alien.ALIEN_TYPES.YOUNG]: { type: Alien.ALIEN_TYPES.YOUNG, sprite: 'alien_young', health: 3, movesPerTurn: 1, attacksPerTurn: 1, attackValue: 2, upgradesTo: Alien.ALIEN_TYPES.ADULT },
    [Alien.ALIEN_TYPES.FRAGMENT]: { type: Alien.ALIEN_TYPES.FRAGMENT, sprite: 'alien_fragment', health: 2, movesPerTurn: 0, attacksPerTurn: 1, attackValue: 2, upgradesTo: Alien.ALIEN_TYPES.YOUNG },
    [Alien.ALIEN_TYPES.EGG]:   { type: Alien.ALIEN_TYPES.EGG, sprite: 'alien_egg', health: 1, movesPerTurn: 0, upgradesTo: Alien.ALIEN_TYPES.YOUNG },
};
