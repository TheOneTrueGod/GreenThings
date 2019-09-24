function ShipRoom(id, x, y, polygon) {
    PIXI.Container.call(this, AssetLoader.getTexture('notgonnawork'));
    this.id = id;
    this.x = x;
    this.y = y;
    this.topLeft = { x: polygon.points[0], y: polygon.points[1] };
    this.bottomRight = { x: polygon.points[0], y: polygon.points[1] };
    for (let i = 2; i + 1 < polygon.points.length; i+= 2) {
        this.topLeft.x = Math.min(polygon.points[i], this.topLeft.x);
        this.topLeft.y = Math.min(polygon.points[i+1], this.topLeft.y);
        this.bottomRight.x = Math.max(polygon.points[i], this.bottomRight.x);
        this.bottomRight.y = Math.max(polygon.points[i+1], this.bottomRight.y);
    }

    this.polygon = polygon;
    this.tokens = [];
    this.playerTokens = [];
    this.alienTokens = [];
    this.playerTokenCount = 0;
    this.alienTokenCount = 0;
    
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0xFFFFFF);
    graphics.drawPolygon(this.polygon.points);
    graphics.closePath();

    this.addChild(graphics);
}

ShipRoom.prototype = Object.create(PIXI.Container.prototype);

ShipRoom.prototype.addTokenSprite = function addTokenSprite(tokenSprite, animate) {
    let targetPoint = undefined;
    while (targetPoint == undefined || !this.polygon.contains(targetPoint.x, targetPoint.y)) {
        targetPoint = {
            x: Math.floor(Math.random() * (this.bottomRight.x - this.topLeft.x) + this.topLeft.x),
            y: Math.floor(Math.random() * (this.bottomRight.y - this.topLeft.y) + this.topLeft.y),
        };
    }

    targetPoint.x += this.position.x;
    targetPoint.y += this.position.y;

    if (animate) {
        tokenSprite.token.playAnimation(Token.ANIMATIONS.move, { position: targetPoint });
    } else {
        tokenSprite.setRoomPosition(targetPoint.x, targetPoint.y);
    }

    this.tokens.push(tokenSprite.token);

    if (tokenSprite.token.isAlienToken()) {
        this.alienTokenCount += 1;
        this.alienTokens.push(tokenSprite.token);
    } else if (tokenSprite.token.isPlayerToken()) {
        this.playerTokenCount += 1;
        this.playerTokens.push(tokenSprite.token);
    }
};

ShipRoom.prototype.removeToken = function removeToken(token) {
    this.tokens.splice(this.tokens.indexOf(token), 1);
    if (token.isAlienToken()) {
        this.alienTokenCount -= 1;
        this.alienTokens.splice(this.alienTokens.indexOf(token), 1);
    } else if (token.isPlayerToken()) {
        this.playerTokenCount -= 1;
        this.playerTokens.splice(this.playerTokens.indexOf(token), 1);
    }
};

ShipRoom.prototype.didClickHit = function didClickHit(clickTarget) {
    return this.polygon.contains(clickTarget.x - this.x, clickTarget.y - this.y);
};

ShipRoom.prototype.setAdjacentRooms = function setAdjacentRooms(adjacentRooms) {
    this.adjacentRooms = adjacentRooms;
};

ShipRoom.prototype.getAdjacentRooms = function getAdjacentRooms() {
    return this.adjacentRooms;
};

ShipRoom.prototype.isAdjacentTo = function isAdjacentTo(room) {
    return this.adjacentRooms.indexOf(room) !== -1;
};

ShipRoom.prototype.createItemByTypename = function createItemByTypename(itemType, gamestate, itemTokenStage) {
    new ItemToken(gamestate, itemType, this, itemTokenStage);
};

ShipRoom.prototype.getFilteredTokens = function getFilteredTokens(tokenType, selectable) {
    return this.tokens.filter((token) => {
        if (selectable && !token.isSelectable()) {
            return false;
        }

        if (tokenType === Token.TOKEN_TYPES.PLAYER && token.isPlayerToken()) { return true; }
        if (tokenType === Token.TOKEN_TYPES.ALIEN && token.isAlienToken()) { return true; }
        if (tokenType === Token.TOKEN_TYPES.ITEM && token.isItemToken()) { return true; }

        return false;
    });
};
