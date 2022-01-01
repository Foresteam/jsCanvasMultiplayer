const canvas = document.getElementById('cnv');
const ctx = canvas.getContext('2d');

const W = 1600, H = 900;

var mX = 0, mY = 0;
var timeLeft = 0;
var gameObjects = [];
const wires = [];

const draw = () => {
	ctx.clearRect(0, 0, W, H);
	for (let obj of gameObjects)
		obj.Render();
	document.getElementById('timer').innerHTML = `Оставшееся время: ${timeLeft}с`;
}

setInterval(draw, 10);

canvas.addEventListener('click', event => {
	let x = event.offsetX, y = event.offsetY;
	for (let obj of gameObjects) {
		if (obj instanceof JoinPoint) {
			if (obj.pos.x <= x && obj.pos.y <= y && obj.pos.x + obj.w >= x && obj.pos.y + obj.h >= y)
				obj.OnClick(new Pos(x, y));
		}
	}
});
canvas.addEventListener('mousemove', event => {
	mX = event.offsetX;
	mY = event.offsetY;
});

RoomListListen(rooms => {
	let list = document.querySelector('#room-list');
	let t = '';
	for (let [id, {players}] of rooms)
		t += `
			<tr class="item">
				<td style="text-align: left; width: 50%">#${id}</td>
				<td style="text-align: center;">${players}/2</td>
				<td style="text-align: center;">${players < 2 ? 'Ожидание' : 'Идет игра'}</td>
				<td align="center"><input type="button" value="Присоединиться"></td>
			</tr>
		`;
	list.innerHTML = t;
});