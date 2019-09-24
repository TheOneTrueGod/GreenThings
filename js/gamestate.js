class GameState {
    constructor() {
        this.phase = GameState.GAME_PHASES.MOVE;
        this.itemEffects = new ItemEffects();
    }

    addItemType(itemType) {
        this.itemEffects.addItemType(itemType);
    }

    getItemEffectForItemType(itemType) {
        return this.itemEffects.getItemEffectForItemType(itemType);
    }

    setPhase(phase) {
        this.phase = phase;
    }

    getPhase() {
        return this.phase;
    }
}

GameState.GAME_PHASES = {
    MOVE: 'move',
    ATTACK: 'attack',
    ALIEN: 'alien',
};
