class AssetLoader {
    static loadAssets(callback) {
        PIXI.loader
            .add("notfound", "/assets/notfound.png")
            
            .add("alien_egg", "/assets/alienEgg.png")
            .add("alien_young", "/assets/alienYoung.png")
            .add("alien_adult", "/assets/alienAdult.png")

            .add("player_basic", "/assets/playerBasic.png")
            .add("player_advanced", "/assets/playerAdvanced.png")

            .add("item_poolcue", "/assets/item_poolcue.png")
            .add("item_knife", "/assets/item_knife.png")
            
            .add("generic_alien", "/assets/alien.png")
            .add("generic_player", "/assets/playerToken.png")
            .load(callback);
    }

    static getTexture(sprite) {
        if (sprite in PIXI.loader.resources) {
            return PIXI.loader.resources[sprite].texture;
        }
        return PIXI.loader.resources["notfound"].texture;
    }
}