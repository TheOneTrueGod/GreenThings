class ItemToken extends Token {
    constructor (gamestate, itemType, room, stage) {
        const itemDef = ItemToken.ItemDefs[itemType];
        super(gamestate, itemDef.sprite, room, stage);
        this.itemDef = itemDef;
        this.itemType = itemType;
        this.startingRoom = room;
        this.roomSprite.width = 15;
        this.roomSprite.height = 15;

        this.gamestate.addItemType(itemType);
    }

    isItemToken() {
        return true;
    }

    respawn() {
        //this.room = this.startingRoom;
    }

    attackTarget(targetToken) {
        let itemEffect = this.gamestate.getItemEffectForItemType(this.itemType);
        itemEffect.doEffectOnTarget(targetToken);
    }

    getPickedUpBy(token) {
        this.room.removeToken(this);
        this.roomSprite.parent && this.roomSprite.parent.removeChild(this.roomSprite);
        this.roomSprite.testSprite.anchor.set(0);
        this.roomSprite.x = this.roomSprite.x - token.roomSprite.x - this.roomSprite.width / 2;
        this.roomSprite.y = this.roomSprite.y - token.roomSprite.y - this.roomSprite.width / 2;

        token.roomSprite.addChild(this.roomSprite);

        this.detailsSprite.parent && this.detailsSprite.parent.removeChild(this.detailsSprite);
        this.detailsSprite.width = TOKEN_SIZE.width / 4;
        this.detailsSprite.height = TOKEN_SIZE.height / 4;
        this.detailsSprite.position.set(
            token.detailsSprite.width - this.detailsSprite.width,
            token.detailsSprite.height - this.detailsSprite.height,
        );
        token.detailsSprite.addChild(this.detailsSprite);
        
        this.room = null;
    }
}

ItemToken.ItemTypes = {
    POOLCUE: 'poolcue',
    KNIFE: 'knife',
}

ItemToken.ItemDefs = {
    [ItemToken.ItemTypes.POOLCUE]: { sprite: 'item_poolcue' },
    [ItemToken.ItemTypes.KNIFE]: { sprite: 'item_knife' },
}
