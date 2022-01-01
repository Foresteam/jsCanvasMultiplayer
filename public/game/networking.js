let ws = new WebSocket(`ws://${location.host}/game`);
ws.onopen = () => {
    ws.onmessage = ({ data: msg }) => {
        let data = JSON.parse(msg);
        // console.log(data);
        let type = data.type;
        data = data.data;
        switch (type) {
            case 'gameStart':
                for (let v of data.myVilki)
                    gameObjects.push(new Vilka(new Pos(...v.pos), v.color, true, v.id));
                for (let v of data.myRozetki)
                    gameObjects.push(new Rozetka(new Pos(...v.pos), v.color, true, v.id));
                for (let v of data.theirVilki)
                    gameObjects.push(new Vilka(new Pos(...v.pos), v.color, false, v.id));
                for (let v of data.theirRozetki)
                    gameObjects.push(new Rozetka(new Pos(...v.pos), v.color, false, v.id));
                console.log(gameObjects);
                break;
            case 'update':
                gameObjects = gameObjects.filter(obj => !(obj instanceof VWire));
                for (let v of data.connections)
                    gameObjects.push(new VWire(v.pos2, v.id, v.rid, v.finished));
                timeLeft = data.timeLeft;
                break;
            case 'gameOver':
                let id = data;
                location = `/view?id=${id}`;
                break;
        }
    }
    setInterval(() => {
        ws.send(JSON.stringify({
            type: 'update',
            data: {
                connections: wires.map(wire => ({
                    pos2: [wire.Pos2().x, wire.Pos2().y],
                    finished: wire.Finished(),
                    id: wire.vilka.id,
                    rid: wire.rozetka ? wire.rozetka.id : -1
                }))
            }
        }));
    }, 50);
};