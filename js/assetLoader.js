class AssetLoader {
    static loadAssets(callback) {
        PIXI.loader
            .add("notfound", "/assets/notfound.png")

            .add("alien_egg", "/assets/alienEgg.png")
            .add("alien_young", "/assets/alienYoung.png")
            .add("alien_adult", "/assets/alienAdult.png")

            .add("player_basic", "/assets/playerBasic.png")
            .add("player_advanced", "/assets/playerAdvanced.png")
            .add("player_robot", "/assets/playerRobot.png")
            .add("player_sheet", "/assets/playerSheet.png")

            .add("item_poolcue", "/assets/item_poolcue.png")
            .add("item_knife", "/assets/item_knife.png")

            .add("generic_alien", "/assets/alien.png")
            .add("generic_player", "/assets/playerToken.png")
            .load(callback);
    }

    static createSprite(spriteName) {
        if (["player_basic", "player_advanced"].indexOf(spriteName) === -1) {
            return new PIXI.Sprite(AssetLoader.getTexture(spriteName));
        }
        const playerSheet = AssetLoader.getTexture("player_sheet");
        const head = Math.floor(Math.random() * 4);
        const body = Math.floor(Math.random() * 2) + (spriteName === "player_advanced") * 2;
        const feet = Math.floor(Math.random() * 4);
        let headTexture = ﻿new ﻿PIXI.Texture﻿( playerSheet.baseTexture, new PIXI.Rectangle(40 * head, 0, 40, 40));
        let shirtTexture = ﻿new ﻿PIXI.Texture﻿( playerSheet.baseTexture, new PIXI.Rectangle(40 * body, 40, 40, 40));
        let pantsTexture = ﻿new ﻿PIXI.Texture﻿( playerSheet.baseTexture, new PIXI.Rectangle(40 * feet, 80, 40, 40));
        const returnSprite = new PIXI.Sprite();
        returnSprite.addChild(new PIXI.Sprite(pantsTexture)).anchor.set(0.5);
        returnSprite.addChild(new PIXI.Sprite(shirtTexture)).anchor.set(0.5);
        returnSprite.addChild(new PIXI.Sprite(headTexture)).anchor.set(0.5);
        return returnSprite;
    }

    static getTexture(sprite) {
        if (sprite in PIXI.loader.resources) {
            return PIXI.loader.resources[sprite].texture;
        }
        return PIXI.loader.resources["notfound"].texture;
    }
}
