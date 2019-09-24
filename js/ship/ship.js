function Ship(gamestate, itemTokenStage) {
    PIXI.Container.call(this);
    this.selectedRoom = null;
    this.rooms = [];

    let roomId = 0;
    const shipDef = Ship.getShipDef();
    shipDef.forEach((roomDef) => {
        const shipRoom = new ShipRoom(
            roomId,
            roomDef.position.x, roomDef.position.y,
            new PIXI.Polygon(roomDef.polygon),
        );
        roomDef.items.forEach((item) => {
            shipRoom.createItemByTypename(item, gamestate, itemTokenStage);
        });
        this.addRoom(shipRoom);
        roomId += 1;
    });

    for (let i = 0; i < shipDef.length; i++) {
        let adjacentRooms = [];
        shipDef[i].adjacentRooms.forEach((adjacentIndex) => {
            if (adjacentIndex !== i) {
                adjacentRooms.push(this.rooms[adjacentIndex]);
            }
        });
        this.rooms[i].setAdjacentRooms(adjacentRooms);
    }
}

Ship.prototype = Object.create(PIXI.Container.prototype);

Ship.prototype.addRoom = function addRoom(room) {
    this.addChild(room);
    this.rooms.push(room);
};

Ship.prototype.getClickedRooms = function getClickedRooms(clickTarget) {
    return this.rooms.filter((room) => room.didClickHit(clickTarget));
};

Ship.prototype.setSelectedRoom = function setSelectedRoom(selectedRoom) {
    if (this.selectedRoom === selectedRoom) { selectedRoom = null; }
    this.rooms.forEach((room) => {
        if (!selectedRoom || room === selectedRoom) {
            room.alpha = 1;
        } else {
            room.alpha = 0.5;
        }
    });

    this.selectedRoom = selectedRoom;
};

Ship.prototype.getSelectedRoom = function getSelectedRoom(selectedRoom) {
    return this.selectedRoom;
};

Ship.prototype.tick = function tick(delta) {
};

Ship.getShipDef = () => { 
    const ySize = 125;
    const xSize = 125;
    return [
        // Nose Cone
        { position: { x:100, y:(ySize * 1) }, polygon: [(xSize * 1),0, (xSize * 1),(ySize * 2), 0,(ySize * 1)], adjacentRooms: [1, 2], items: [ItemToken.ItemTypes.POOLCUE] },
        // Center Boxes (top, bottom)
        { position: { x:100 + (xSize * 1), y:(ySize * 1) }, polygon: [0,0, (xSize * 1),0, (xSize * 1),(ySize * 1), 0,(ySize * 1)], adjacentRooms: [0, 2, 3, 5], items: [] },
        { position: { x:100 + (xSize * 1), y:(ySize * 2) }, polygon: [0,0, (xSize * 1),0, (xSize * 1),(ySize * 1), 0,(ySize * 1)], adjacentRooms: [0, 1, 4, 6], items: [] },
        
        // Tail (top, bottom)
        { position: { x:100 + (xSize * 2), y:(ySize * 1) }, polygon: [0,0, (xSize * 1),0, 0,(ySize * 1)], adjacentRooms: [1], items: [] },
        { position: { x:100 + (xSize * 2), y:(ySize * 2) }, polygon: [0,0, (xSize * 1),(ySize * 1), 0,(ySize * 1)], adjacentRooms: [2], items: [] },
        
        // Wings (top, bottom)
        { position: { x:100 + (xSize * 1), y:0 }, polygon: [(xSize * 1),0, (xSize * 1),(ySize * 1), 0,(ySize * 1)], adjacentRooms: [1], items: [ItemToken.ItemTypes.POOLCUE] },
        { position: { x:100 + (xSize * 1), y:(ySize * 3) }, polygon: [0,0, (xSize * 1),0, (xSize * 1),(ySize * 1)], adjacentRooms: [2], items: [ItemToken.ItemTypes.KNIFE] },
    ] 
};
