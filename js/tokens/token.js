class Token {
    constructor (gamestate, spriteName, room, stage) {
        this.room = room;
        this.gamestate = gamestate;
        if (gamestate === undefined) { throw new Error("gamestate can't be undefined"); }

        this.roomSprite = new TokenSprite(this, stage, spriteName);
        this.detailsSprite = new TokenDetailsSprite(this, spriteName, (ev, button) => { this.detailsClickCallback(ev, button); });
        this.movesPerTurn = 0;
        this.attacksPerTurn = 0;
        this.movesLeft = 0;
        this.attacksLeft = 0;
        this.maxHealth = 1;
        this.health = 1;
        this.clickCallback = null;
        this.state = {
            'selected': false,
        }
        this.animations = [];
        this.markedForDeletion = false;
    }

    destroy(tokenController) {
        this.room.removeToken(this);
        this.roomSprite.parent.removeChild(this.roomSprite);
        this.detailsSprite.parent && this.detailsSprite.parent.removeChild(this.detailsSprite);
        tokenController.removeToken(this);
    }

    setVisible(visible) {
        this.roomSprite.setVisible(visible);
    }

    moveToRoom(room) {
        if (room === this.room) {
            return;
        }
        if (this.room) {
            this.room.removeToken(this);
        }
        this.room = room;
        room.addTokenSprite(this.roomSprite, true);
    }

    isAlive() {
        return true;
    }

    isSelectable() {
        if (this.gamestate.getPhase() === GameState.GAME_PHASES.ALIEN) { return this.isSelected(); }
        if (this.gamestate.getPhase() === GameState.GAME_PHASES.MOVE) { return this.movesLeft > 0 || this.isSelected(); }
        if (this.gamestate.getPhase() === GameState.GAME_PHASES.ATTACK) { return this.attacksLeft > 0 || this.isSelected(); }
        throw new Error("Not handled");
    }

    isSelected() {
        return this.state.selected;
    }

    setSelected(selected) {
        this.state.selected = selected;
        this.updateState();
    }

    updateState() {
        this.detailsSprite.selectedRectangle.visible = !!this.state.selected;
    }

    removeClickCallback() {
        this.clickCallback = null;
    }

    addClickCallback(callback) {
        this.clickCallback = callback;
    }

    detailsClickCallback(ev, button) {
        this.clickCallback && this.clickCallback(ev, button);
    }

    getDetailsSprite() {
        this.detailsSprite.width = TOKEN_SIZE.width;
        this.detailsSprite.height = TOKEN_SIZE.height;
        return this.detailsSprite;
    }

    startTurn() {
        this.movesLeft = this.movesPerTurn;
        this.attacksLeft = this.attacksPerTurn;
        this.health = this.maxHealth;
    }

    isAlienToken() {
        return false;
    }

    isPlayerToken() {
        return false;
    }

    isItemToken() {
        return false;
    }

    canInteractWithItem(itemToken) {
        return false;
    }

    interactWithItem(itemToken) {

    }

    playAnimation(animation, properties) {
        this.animations.push({ animation, time: 0, properties });
    }

    createSprite(spriteName) {
        this.roomSprite.createSprite(spriteName);
        this.detailsSprite.createSprite(spriteName);
    }

    tick(delta) {
        if (this.animations.length) {
            let animationComplete = false;
            const firstAnim = this.animations[0];
            let prevTime = firstAnim.time;
            let ANIMATION_TIME = 20;
            switch (firstAnim.animation) {
                case Token.ANIMATIONS.move:
                    firstAnim.time += delta;
                    const speed = 2 * delta;
                    const targX = firstAnim.properties.position.x;
                    const targY = firstAnim.properties.position.y;

                    const moveVictor = Victor(targX - this.roomSprite.position.x, targY - this.roomSprite.position.y);

                    if (moveVictor.length() <= speed) {
                        this.roomSprite.position.x = targX;
                        this.roomSprite.position.y = targY;
                        animationComplete = true;
                    } else {
                        moveVictor.normalize();
                        this.roomSprite.position.x += moveVictor.x * speed;
                        this.roomSprite.position.y += moveVictor.y * speed;
                    }
                break;
                case Token.ANIMATIONS.spawn:
                    firstAnim.time += delta;

                    this.roomSprite.setRotation(Math.min(firstAnim.time / ANIMATION_TIME * Math.PI * 2, Math.PI * 2));
                    if (firstAnim.time >= ANIMATION_TIME) {
                        const newToken = firstAnim.properties.newToken;
                        const tokenPosition = { x: newToken.roomSprite.position.x, y: newToken.roomSprite.position.y };
                        newToken.roomSprite.setRoomPosition(this.roomSprite.position.x, this.roomSprite.position.y);
                        newToken.playAnimation(
                            Token.ANIMATIONS.move,
                            { position: tokenPosition },
                        );
                        newToken.setVisible(true);
                        animationComplete = true;
                    }
                break;
                case Token.ANIMATIONS.upgrade:
                    ANIMATION_TIME = 40;
                    firstAnim.time = Math.min(firstAnim.time + delta, ANIMATION_TIME);
                    if (firstAnim.time < ANIMATION_TIME / 2) {
                        this.roomSprite.scale.x = 1 - (firstAnim.time / (ANIMATION_TIME / 2));
                    } else {
                        this.roomSprite.scale.x = ((firstAnim.time - (ANIMATION_TIME / 2)) / (ANIMATION_TIME / 2));
                    }
                    if (
                        firstAnim.time - delta < ANIMATION_TIME / 2 &&
                        firstAnim.time >= ANIMATION_TIME / 2
                    ) {
                        const alienDef = Alien.AlienDefs[this.alienType];
                        this.createSprite(alienDef.sprite);
                    }
                    if (firstAnim.time >= ANIMATION_TIME) {
                        animationComplete = true;
                    }
                break;
                case Token.ANIMATIONS.pickUpItem:
                    ANIMATION_TIME = 20;
                    firstAnim.time = Math.min(firstAnim.time + delta, ANIMATION_TIME);
                    let { startX, startY } = firstAnim.properties;
                    let pctLeft = 1 - firstAnim.time / ANIMATION_TIME;
                    firstAnim.properties.itemToken.roomSprite.position.set(
                        startX * pctLeft,
                        startY * pctLeft
                    );

                    if (firstAnim.time >= ANIMATION_TIME) {
                        animationComplete = true;
                        firstAnim.properties.itemToken.roomSprite.position.set(0, 0);
                    }
                    break;
                case Token.ANIMATIONS.attack:
                    ANIMATION_TIME = 20;
                    if (firstAnim.properties.target.animations.length) { break; }
                    firstAnim.time = Math.min(firstAnim.time + delta, ANIMATION_TIME);

                    if (firstAnim.time === ANIMTION_TIME) {
                        this.roomSprite.position.x = firstAnim.properties.position.x;
                        this.roomSprite.position.y = firstAnim.properties.position.y;
                    } else {
                        let moveSrc = firstAnim.properties.position;
                        let moveDest = firstAnim.properties.target.position;
                        let moveVictor = Victor(moveDest.x - moveSrc.x, moveDest.y - moveSrc.y);
                        moveVictor.multiply(new Victor(0.5, 0.5));
                        if (prevTime > ANIMATION_TIME / 2) {
                            moveVictor.multiply(new Victor(-1, -1));
                        }

                        this.roomSprite.position.x += moveVictor.x / ANIMATION_TIME / 2;
                        this.roomSprite.position.y += moveVictor.y / ANIMATION_TIME / 2;

                        if (prevTime < ANIMATION_TIME / 2 && firstAnim.time >= ANIMATION_TIME / 2) {
                            // TODO: Display damage?
                            if (!firstAnim.properties.target.isAlive()) {
                                firstAnim.properties.target.playAnimation(
                                    Token.ANIMATIONS.die,
                                    { target: targetToken }
                                );
                            }
                        }
                    }
                    break;
                case Token.ANIMATIONS.die:
                  ANIMATION_TIME = 15;
                  firstAnim.time = Math.min(firstAnim.time + delta, ANIMATION_TIME);
                  this.roomSprite.alpha = firstAnim.time / ANIMATION_TIME
                  if (firstAnim.time === ANIMATION_TIME) {
                      this.markedForDeletion = true;
                  }
            }
            if (animationComplete) {
                this.animations.shift();
            }
        }
    };
}

Token.ANIMATIONS = { move: 'move', spawn: 'spawn', upgrade: 'upgrade', pickUpItem: 'pick_up_item', attack: 'attack', die: 'die' };
Token.TOKEN_TYPES = { ALIEN: 'alien', PLAYER: 'player', ITEM: 'item' }

function TokenDetailsSprite(token, spriteName, clickCallback) {
    PIXI.Container.call(this);

    this.token = token;
    this.createSprite(spriteName);
    /*this.testSprite = new PIXI.Sprite(AssetLoader.getTexture(spriteName));
    this.testSprite.anchor.set(0.5);
    this.testSprite.position.set(TOKEN_SIZE.width / 2, TOKEN_SIZE.height / 2);*/
    this.interactive = true;
    this.on('click', (ev) => { clickCallback(ev, 'left') });
    this.on('rightclick', (ev) => { clickCallback(ev, 'right') });

    const graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0xFFFF00, 1);
    graphics.drawPolygon([0,0, TOKEN_SIZE.width,0, TOKEN_SIZE.width,TOKEN_SIZE.height, 0,TOKEN_SIZE.height]);
    graphics.closePath();
    this.selectedRectangle = graphics;

    this.addChild(this.testSprite);
    this.addChild(this.selectedRectangle);

    this.selectedRectangle.visible = false;
}

TokenDetailsSprite.prototype = Object.create(PIXI.Container.prototype);
TokenDetailsSprite.prototype.setRotation = function setRotation(angle) {
    this.testSprite.rotation = angle;
}

TokenDetailsSprite.prototype.createSprite = function createSprite(spriteName) {
    if (this.testSprite) { this.removeChild(this.testSprite); }
    this.testSprite = new PIXI.Sprite(AssetLoader.getTexture(spriteName));
    this.testSprite.anchor.set(0.5);
    this.testSprite.position.set(TOKEN_SIZE.width / 2, TOKEN_SIZE.height / 2);
    this.testSprite.width = TOKEN_SIZE.width;
    this.testSprite.height = TOKEN_SIZE.height;

    this.addChild(this.testSprite);
}

function TokenSprite(token, stage, spriteName) {
    PIXI.Container.call(this);

    this.token = token;
    this.token.room.addTokenSprite(this);
    stage.addChild(this);

    this.createSprite(spriteName);
}

TokenSprite.prototype = Object.create(PIXI.Container.prototype);

TokenSprite.prototype.setRoomPosition = function setRoomPosition(x, y) {
    this.position.set(x, y);
};

TokenSprite.prototype.setRotation = function setRotation(angle) {
    this.testSprite.rotation = angle;
};

TokenSprite.prototype.setVisible = function setVisible(visible) {
    this.testSprite.visible = visible;
};

TokenSprite.prototype.createSprite = function createSprite(spriteName) {
    if (this.testSprite) { this.removeChild(this.testSprite); }
    this.testSprite = new PIXI.Sprite(AssetLoader.getTexture(spriteName));
    this.testSprite.anchor.set(0.5);
    this.addChild(this.testSprite);
};
