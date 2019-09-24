class InteractionHandler {
    constructor(gamestate, ship, stage, app, tokenController, alienAI, tokenContainer) {
        this.gamestate = gamestate;
        this.ship = ship;
        this.tokenController = tokenController;
        this.tokenPadding = 4;
        ship.interactive = true;
        stage.interactive = true;

        this.selectedTokens = [];

        $('#doneMoveButton').on('click', () => {
            this.setPhase(GameState.GAME_PHASES.ATTACK, tokenController);
        });

        $('#doneAttackButton').on('click', () => {
            this.setPhase(GameState.GAME_PHASES.ALIEN, tokenController);
            alienAI.playOutTurn(ship, tokenController, tokenContainer);
            this.setPhase(GameState.GAME_PHASES.MOVE, tokenController);
        });
        ship.on('click', (ev) => this.handleShipClick(ev));
        ship.on('rightclick', (ev) => this.handleShipRightClick(ev));
        //stage.on('mousedown', (ev) => { console.log('click'); this.ship.setSelectedRoom(null) });

        this.roomDetailsContainer = new PIXI.Container();
        this.playerTokenDisplayContainer = new PIXI.Container();
        this.itemTokenDisplayContainer = new PIXI.Container();
        this.alienTokenDisplayContainer = new PIXI.Container();

        const graphics = new PIXI.Graphics();
        graphics.lineStyle(2, 0x000000, 1);
        graphics.beginFill(0xFFFFFF);
        graphics.drawPolygon([
            0,0,
            GAME_SIZE.x,0,
            GAME_SIZE.x,(TOKEN_SIZE.height + this.tokenPadding * 2) * 3,
            0,(TOKEN_SIZE.height + this.tokenPadding * 2) * 3,
        ]);
        graphics.closePath();
        graphics.endFill();

        this.roomDetailsContainer.addChild(graphics);
        this.roomDetailsContainer.alpha = 0;

        this.roomDetailsContainer.addChild(this.playerTokenDisplayContainer);
        this.roomDetailsContainer.addChild(this.alienTokenDisplayContainer);
        this.roomDetailsContainer.addChild(this.itemTokenDisplayContainer);
        this.playerTokenDisplayContainer.width = GAME_SIZE.x / 2;
        this.alienTokenDisplayContainer.width = GAME_SIZE.x / 2;
        this.alienTokenDisplayContainer.position.set(GAME_SIZE.x / 2, 0);
        this.playerTokenDisplayContainer.position.set(0, 0);

        const itemContainerHeight = TOKEN_SIZE.height + this.tokenPadding * 2;
        this.itemTokenDisplayContainer.width = GAME_SIZE.x;
        this.itemTokenDisplayContainer.height = itemContainerHeight;
        this.itemTokenDisplayContainer.position.set(0, this.roomDetailsContainer.height - itemContainerHeight );
        
        stage.addChild(this.roomDetailsContainer);

        app.ticker.add((delta) => {
            let deltaAlpha = 0.05 * delta;
            if (!this.ship.selectedRoom) {
                deltaAlpha *= -1;
            }

            this.roomDetailsContainer.alpha = Math.max(0, Math.min(1, this.roomDetailsContainer.alpha + deltaAlpha));
        });

        this.setPhase(GameState.GAME_PHASES.MOVE, tokenController);
    }

    setPhase(phase, tokenController) {
        if (
            phase === GameState.GAME_PHASES.MOVE ||
            phase === GameState.GAME_PHASES.ALIEN
        ) {
            tokenController.startTurn();
        }
        this.gamestate.setPhase(phase);
        tokenController.updateAllTokens();
        $(`[data-phase]`).hide();
        $(`[data-phase=${this.gamestate.getPhase()}]`).show();
        this.hideDetailsContainer();
    }

    getTokenPosition(container, tokenIndex, rtl) {
        const containerWidth = GAME_SIZE.x / 2;
        const padding = this.tokenPadding;
        const tokensPerRow = Math.floor((containerWidth - padding * 2) / TOKEN_SIZE.width);
        const tokenGap = ((containerWidth - padding * 2) - (tokensPerRow * TOKEN_SIZE.width)) / (tokensPerRow - 1);

        let x = padding + (tokenIndex % tokensPerRow) * (TOKEN_SIZE.width + tokenGap);
        if (rtl) { x = containerWidth - x - TOKEN_SIZE.width }
        const y = padding + Math.floor((tokenIndex / tokensPerRow)) * (TOKEN_SIZE.height + tokenGap);;
        return { x, y };
    }

    handleTokenClick(ev, button, token) {
        if (button === 'left') {
            if (
                this.gamestate.getPhase() !== GameState.GAME_PHASES.MOVE &&
                this.gamestate.getPhase() !== GameState.GAME_PHASES.ATTACK
            ) {
                return;
            }
            if (token.isPlayerToken() && token.isSelectable(this.gamestate.getPhase())) {
                if (token.isSelected()) {
                    this.selectedTokens.splice(this.selectedTokens.indexOf(token), 1);
                    token.setSelected(false);
                } else {
                    this.selectedTokens.push(token);
                    token.setSelected(true);
                }
            }
        } else if (button === 'right') {
            if (token.isAlienToken() && this.gamestate.getPhase() === GameState.GAME_PHASES.ATTACK) {
                let attackingTokens = this.selectedTokens;
                if (!attackingTokens.length) {
                    attackingTokens = this.ship.getSelectedRoom().getFilteredTokens(Token.TOKEN_TYPES.PLAYER, true);
                    if (attackingTokens.length) {
                        attackingTokens = [attackingTokens[0]];
                    }
                }
                for (let i = attackingTokens.length - 1; i >= 0 && token.isAlive(); i--) {
                    attackingTokens[i].attackTarget(token);
                    this.unselectToken(attackingTokens[i]);
                    attackingTokens.splice(i, 1);
                }
                if (!token.isAlive()) {
                    token.destroy(this.tokenController);
                    //this.buildDetailsContainer();
                }
            } else if (token.isItemToken() && this.gamestate.getPhase() === GameState.GAME_PHASES.MOVE) {
                let interactingTokens = this.selectedTokens;
                if (!interactingTokens.length) {
                    interactingTokens = this.ship.getSelectedRoom().getFilteredTokens(Token.TOKEN_TYPES.PLAYER, true);
                }
                interactingTokens = interactingTokens.filter((interactingToken) => { return interactingToken.canInteractWithItem(token); });
                if (!interactingTokens.length) {
                    return;
                }
                let interactingToken = interactingTokens[0];
                interactingToken.interactWithItem(token);
                //this.buildDetailsContainer();
            }
        }
    }

    unselectToken(token) {
        token.removeClickCallback();
        token.setSelected(false);
    }

    handleShipRightClick(ev) {
        if (this.gamestate.getPhase() !== GameState.GAME_PHASES.MOVE) {
            return;
        }

        let targets = this.ship.getClickedRooms(ev.data.global);
        if (!targets) {
            this.ship.setSelectedRoom(null);
            return;
        }
        
        let clickedRoom = targets[0];
        if (!clickedRoom.isAdjacentTo(this.ship.getSelectedRoom())) {
            return;   
        }
        
        const playerTokens = this.ship.getSelectedRoom().getFilteredTokens(Token.TOKEN_TYPES.PLAYER, true);
        if (!this.selectedTokens && !playerTokens) { return; }

        if (this.selectedTokens.length > 0) {
            this.selectedTokens.forEach((token) => {
                token.doMoveAction(clickedRoom);
                this.unselectToken(token);
            })
        } else if (playerTokens.length) {
            playerTokens[0].doMoveAction(clickedRoom);
        }

        this.selectedTokens = [];

        this.buildDetailsContainer();
    }

    handleShipClick(ev) {
        if (
            this.gamestate.getPhase() !== GameState.GAME_PHASES.MOVE &&
            this.gamestate.getPhase() !== GameState.GAME_PHASES.ATTACK
        ) {
            return;
        }
        let targets = this.ship.getClickedRooms(ev.data.global);
        if (!targets) {
            this.ship.setSelectedRoom(null);
            return;
        }
        let clickedRoom = targets[0];
        this.ship.setSelectedRoom(clickedRoom);

        this.buildDetailsContainer();
    }

    emptyDetailsContainer() {
        for (let i = this.alienTokenDisplayContainer.children.length - 1; i >= 0; i--) {
            const sprite = this.alienTokenDisplayContainer.children[i];
            this.unselectToken(sprite.token);
            this.alienTokenDisplayContainer.removeChild(sprite);
        }
        for (let i = this.playerTokenDisplayContainer.children.length - 1; i >= 0; i--) {
            const sprite = this.playerTokenDisplayContainer.children[i];
            this.unselectToken(sprite.token);
            this.playerTokenDisplayContainer.removeChild(sprite);
        }

        for (let i = this.itemTokenDisplayContainer.children.length - 1; i >= 0; i--) {
            const sprite = this.itemTokenDisplayContainer.children[i];
            //this.unselectToken(sprite.token);
            this.itemTokenDisplayContainer.removeChild(sprite);
        }

        this.selectedTokens = [];
    }

    hideDetailsContainer() {
        this.emptyDetailsContainer();
        this.ship.setSelectedRoom(null);
    }
    
    buildDetailsContainer() {
        if (this.ship.selectedRoom) {
            /*if (this.ship.selectedRoom.y > this.ship.parent.height / 4) {
                this.roomDetailsContainer.y = 0;
            } else {
                this.roomDetailsContainer.y = GAME_SIZE.y - this.roomDetailsContainer.height;
            }*/
            this.roomDetailsContainer.y = GAME_SIZE.y - this.roomDetailsContainer.height;
            
            this.emptyDetailsContainer();

            this.ship.selectedRoom.tokens.forEach((token) => {
                let container = undefined;
                if (token.isAlienToken()) {
                    container = this.alienTokenDisplayContainer;
                } else if (token.isPlayerToken()) {
                    container = this.playerTokenDisplayContainer;
                } else if (token.isItemToken()) {
                    container = this.itemTokenDisplayContainer;
                } else {
                    return;
                }

                const detailsSprite = token.getDetailsSprite();
                detailsSprite.parent && detailsSprite.parent.removeChild(detailsSprite);
                const tokenPosition = this.getTokenPosition(container, container.children.length, token.isAlienToken());
                detailsSprite.position.set(tokenPosition.x, tokenPosition.y);
                container.addChild(detailsSprite);

                token.addClickCallback((ev, button) => {
                    this.handleTokenClick(ev, button, token);
                });
            })
        }
    }
}
