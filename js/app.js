$(document).ready(() => {
    $('#gameContainer').on('contextmenu', (ev) => {
        ev.preventDefault();
        return false;
    });
    
    const initializePixi = () => {
        var gameCanvasContainer = $('#gameCanvasContainer');

        let canvasWidth = 800;
        let canvasHeight = 600;

        var app = new PIXI.Application({ width: canvasWidth, height: canvasHeight, backgroundColor: 0x1099bb });

        //Add the canvas to the HTML document
        gameCanvasContainer.append(app.view);
        return { app, stage: app.stage };
    };

    new Promise((resolve, reject) => {
        AssetLoader.loadAssets(() => { resolve(); })
    }).then(() => {
        $('.screen').hide();
        $('#gameCanvasContainer.screen').show();
        const { app, stage } = initializePixi();
        let mainGame = new MainGame(app, stage);
        mainGame.startGame();
    });
});