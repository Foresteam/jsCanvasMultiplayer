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
	document.getElementById('timer').innerHTML = `Time left: ${Math.floor(timeLeft)}с`;
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

const Join = id => {
	Networking('join', `id=${id}`);
	SetStatus('In game');
}