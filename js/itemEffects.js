class ItemEffects {
    constructor() {
        this.itemEffectMap = {};
        this.itemEffectBucket = [
            new ItemEffectDealDamage(1),
            new ItemEffectDealDamage(1),
            new ItemEffectDealDamage(3),
            new ItemEffectDealDamage(3),
            new ItemEffectDealDamage(5),
            new ItemEffectDealDamage(5),
        ];
    }

    pullEffectFromBucket() {
        if (!this.itemEffectBucket) {
            return new ItemEffectNoEffect();
        }
        let index = Math.floor(Math.random() * this.itemEffectBucket.length);

        return this.itemEffectBucket.splice(index, 1)[0];
    }

    addItemType(itemType) {
        if (!this.itemEffectMap[itemType]) {
            this.itemEffectMap[itemType] = ItemEffects.EFFECT_TYPES.UNKNOWN;
        }
    }

    getItemEffectForItemType(itemType) {
        if (
            !this.itemEffectMap[itemType] || 
            this.itemEffectMap[itemType] == ItemEffects.EFFECT_TYPES.UNKNOWN
        ) {
            this.itemEffectMap[itemType] = this.pullEffectFromBucket();
        }
        return this.itemEffectMap[itemType];
    }
}

class ItemEffect {
    constructor() {

    }

    doEffectOnTarget(targetToken) {

    }
}

class ItemEffectNoEffect extends ItemEffect {

}

class ItemEffectDealDamage extends ItemEffect {
    constructor(amount) {
        super();
        this.amount = amount;
    }

    doEffectOnTarget(targetToken) {
        targetToken.health -= this.amount;
    }
}

ItemEffects.EFFECT_TYPES = {
    UNKNOWN: 'unknown',
};
