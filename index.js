const express = require('express');
const bodyParser = require('body-parser');
const expressWs = require('express-ws');
const et = require('./etemporal.js');

const db = new et.DB('kek.json');
const sm = new et.SocketMaster();

const app = express();
expressWs(app);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/templates');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
// app.use(cookieSession({
//     name: 'session',
//     keys: ['key1', 'key2']
// }));


Array.prototype.ejectRandom = function() {
	let i = Math.floor(Math.random() * this.length);
	let item = this[i];
	this.splice(i, 1);
	return item;
}
const W = 1600, H = 900;
const totalRozetok = 15;
class Pair {
	constructor(colors, iiHorizontal, iiVertical, cellSizeHorizontal, cellSizeVertical, id) {
		if (cellSizeVertical) {
			let color = colors.ejectRandom();
			let iHor = iiHorizontal.ejectRandom();
			let iVer = iiVertical.ejectRandom();

			this.rozetka = { pos: [50 + iHor * cellSizeHorizontal, 0], color, id };
			this.vilka = { pos: [0, 30 / 2 + iVer * cellSizeVertical], color, id };
		}
		else {
			let pair = cellSizeHorizontal;
			this.rozetka = { pos: [...pair.rozetka.pos], color: pair.rozetka.color, id: pair.rozetka.id };
			this.vilka = { pos: [...pair.vilka.pos], color: pair.vilka.color, id: pair.vilka.id };
		}
	}
}

const gameTime = 60;
class GameRoom {
	constructor() {
		this.players = []; // { sock: socket, id: socket.id, connections, vilki, rozetki }

		this.time = 0;
		this._update = null;

		this.colors = [
			'#F00',
			'#0F0',
			'#00F',
			'#0FF',
			'#F0F',
			'#FF0',
			'#FA8',
			'#093',
			'#79F',
			'#000',
			'#FFF',
			'#F8F',
			'#F99',
			'#BBB',
			'#FA0',
			'#5F5'
		];
		this.iiHorizontal = [], this.iiVertical = [];

		this.cellSizeHorizontal = W / totalRozetok;
		this.cellSizeVertical = H / totalRozetok;
		for (let i = 0; i < totalRozetok; i++) {
			this.iiVertical.push(i);
			this.iiHorizontal.push(i);
		}
	}
	playerConnected(sock) {
		this.players.push({ sock, id: sock.id, vilki: [], rozetki: [], connections: [] });
		console.log(`Player #${sock.id} connected`);
	}
	playerLeft(id) {
		this.players = this.players.filter(v => v.id != id);
		console.log(`Player #${id} disconnected`);
		if (this.players.length == 0)
			this.end();
	}
	start() {
		this.time = Date.now();
		for (let v of this.players)
			v.pairs = [];
		for (let i = 0; i < totalRozetok; i++) {
			let pair = new Pair(this.colors, this.iiHorizontal, this.iiVertical, this.cellSizeHorizontal, this.cellSizeVertical, i);
			this.players[0].pairs.push(pair);
			this.players[1].pairs.push(new Pair(this.colors, this.iiHorizontal, this.iiVertical, pair));
		}
		for (let k = 0; k < this.players[1].pairs.length; k++) {
			let vp = this.players[1].pairs[k].vilka.pos;
			let rp = this.players[1].pairs[k].rozetka.pos;
			this.players[1].pairs[k].vilka.pos = [W - vp[0] - 30, vp[1]];
			this.players[1].pairs[k].rozetka.pos = [rp[0], H - rp[1] - 50];
		}

		for (let v of this.players) {
			v.vilki = v.pairs.map(vv => vv.vilka);
			v.rozetki = v.pairs.map(vv => vv.rozetka);
		}

		this._update = setInterval(() => this.update(), 50);
	}
	update() {
		for (let ply of this.players) {
			ply.score = 0;
			for (let c of ply.connections)
				if (c.id == c.rid)
					ply.score++;
		}
		for (let ply of this.players)
			if (ply.score == totalRozetok) {
				this.over();
				return;
			}
		if (Date.now() - this.time > 1000 * gameTime) {
			this.over();
			return;
		}
		for (let i = 0; i < 2; i++)
			this.players[i].sock.send(JSON.stringify({
				type: 'update',
				data: {
					connections: this.players[(i + 1) % 2].connections,
					timeLeft: gameTime - (Date.now() - this.time) / 1000
				}
			}));
	}
	end() {
		clearInterval(this._update);
		gameRoom = null;
		delete this;
	}
	over() {
		let record = { winner: 0, scoreWin: 0, scoreLoose: 0, playTime: (Date.now() - this.time) / 1000, id: db.self.length };
		let p1 = this.players[0], p2 = this.players[1];
		if (p1.score > p2.score) {
			record.winner = 1;
			record.scoreWin = p1.score * 1 / record.playTime;
			record.scoreLoose = p2.score * 1 / record.playTime;
		}
		else if (p1.score < p2.score) {
			record.winner = 2;
			record.scoreWin = p2.score * 1 / record.playTime;
			record.scoreLoose = p1.score * 1 / record.playTime;
		}
		db.self.push(record);
		db.save();
		for (let ply of this.players)
			ply.sock.send(JSON.stringify({
				type: 'gameOver',
				data: record.id
			}));
		this.end();
	}
}
let gameRoom = null;

console.log('Server started');
app.ws('/game', async (ws, rq) => {
	if (!gameRoom)
		gameRoom = new GameRoom();
	if (gameRoom.players.length >= 2)
		return ws.close();
	gameRoom.playerConnected(sm.enslave(ws, id => gameRoom && gameRoom.playerLeft(id)));
	ws.onmessage = ({ data: msg }) => {
		if (!gameRoom)
			return ws.onmessage = null;
		let data = JSON.parse(msg);
		let type = data.type;

		let ply = gameRoom.players.filter(v => v.id == ws.id)[0];

		switch (type) {
			case 'update':
				ply.connections = data.data.connections;
				break;
		}
	}
	if (gameRoom.players.length < 2)
		return ws.send(JSON.stringify({ type: '...', data: null }));

	gameRoom.start();
	for (let i = 0; i < 2; i++)
		gameRoom.players[i].sock.send(JSON.stringify({
			type: 'gameStart',
			data: {
				myVilki: gameRoom.players[i].vilki,
				myRozetki: gameRoom.players[i].rozetki,
				theirVilki: gameRoom.players[(i + 1) % 2].vilki,
				theirRozetki: gameRoom.players[(i + 1) % 2].rozetki
			}
		}));
});

app.get('/view', (rq, rs) => {
	let id = rq.query.id;
	rs.render('view', { record: id ? db.self[id] : db.self, solo: !!id });
});

app.listen(80);