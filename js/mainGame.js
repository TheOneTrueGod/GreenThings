class MainGame {
    constructor(app, stage) {
        this.PIXIApp = app;
        this.stage = stage;
        this.gamestate = new GameState();
        const tokenContainer = new PIXI.Container();

        this.ship = new Ship(this.gamestate, tokenContainer);
        this.tokenController = new TokenController();
        stage.addChild(this.ship);
        stage.addChild(tokenContainer);
        this.ship.position.set(0, 0);
        this.interactionHandler = new InteractionHandler(
            this.gamestate,
            this.ship,
            stage,
            app,
            this.tokenController,
            new GreenThingAlienAI(),
            tokenContainer,
        );

        for (let i = 0; i < 5; i++) {
            this.tokenController.addToken(new PlayerToken(this.gamestate, this.ship.rooms[0], tokenContainer), this.ship);
        }

        let room = Math.floor(Math.random() * (this.ship.rooms.length - 1)) + 1;
        this.tokenController.addToken(new Alien(this.gamestate, Alien.ALIEN_TYPES.EGG, this.ship.rooms[room], tokenContainer), this.ship);
        room = Math.floor(Math.random() * (this.ship.rooms.length - 1)) + 1;
        this.tokenController.addToken(new Alien(this.gamestate, Alien.ALIEN_TYPES.YOUNG, this.ship.rooms[room], tokenContainer), this.ship);
        for (let i = 0; i < 2; i++) {
            room = Math.floor(Math.random() * (this.ship.rooms.length - 1)) + 1;
            this.tokenController.addToken(new Alien(this.gamestate, Alien.ALIEN_TYPES.ADULT, this.ship.rooms[room], tokenContainer), this.ship);
        }

        app.ticker.add((delta) => {
            this.tick(delta);
        });
    }

    tick(delta) {
        this.ship.tick(delta);
        this.tokenController.tick(delta);
    }

    startGame() {
        this.tokenController.startTurn();
    }
}