class TokenController {
    constructor() {
        this.tokens = [];
        this.playerTokens = [];
        this.alienTokens = [];
    }

    addToken(token) {
        this.tokens.push(token);
        if (token.isPlayerToken()) {
            this.playerTokens.push(token);
        } else if (token.isAlienToken()) {
            this.alienTokens.push(token);
        }
    }

    removeToken(token) {
        const index = this.tokens.indexOf(token);
        if (index !== -1) {
            this.tokens.splice(index, 1);
            if (token.isAlienToken()) { this.alienTokens.splice(this.alienTokens.indexOf(token), 1); }
            if (token.isPlayerToken()) { this.playerTokens.splice(this.playerTokens.indexOf(token), 1); }
        }
    }

    startTurn() {
        this.tokens.forEach((token) => {
            token.startTurn();
        });
    }

    updateAllTokens() {
        this.tokens.forEach((token) => {
            token.updateState();
        });
    }

    tick(delta) {
        this.tokens.forEach((token) => { token.tick(delta); });
        for (let i = 0; i < this.tokens.length;) {
            if (this.tokens[i].markedForDeletion) {
                this.tokens[i].destroy();
            } else {
              i ++;
            }
        }
    }
}
