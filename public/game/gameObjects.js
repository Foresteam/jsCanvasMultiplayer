let lastClickedOn = null;
let currentRenderMode = 'source-over';
let currentBackgroundColor = 'white';
let cock = document.getElementById('cock');
let rozetkaImg = document.getElementById('rozetka');
let vilkaImg = document.getElementById('vilka');

class Pos {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class RenderObject {
    constructor() { }
    Render() { }
}
class JoinPoint extends RenderObject {
    constructor(pos, color, my, id) {
        super();
        this.pos = pos;
        this.color = color;
        this.id = id;
        this.w = 50;
        this.h = 50;
        this.connection = null;
        this.my = my;
    }
    OnClick() {
        return this.my;
    }
    Render() {
        ctx.drawImage(this.img, this.pos.x, this.pos.y, this.w, this.h);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        ctx.globalCompositeOperation = currentRenderMode;
        ctx.fillStyle = currentBackgroundColor;
    }
}
class Rozetka extends JoinPoint {
    constructor(pos, color, my, id) {
        super(pos, color, my, id);
        this.img = rozetkaImg;
    }
    OnClick(pos) {
        if (!super.OnClick(pos))
            return;
        if (lastClickedOn instanceof Rozetka) {
            gameObjects.splice(gameObjects.indexOf(lastClickedOn.connection), 1);
            wires.splice(wires.indexOf(lastClickedOn.connection), 1);
            lastClickedOn = this;
            return;
        }
        if (lastClickedOn instanceof Vilka) {
            if (this.connection) {
                this.connection.vilka.connection = null;
                gameObjects.splice(gameObjects.indexOf(this.connection), 1);
                wires.splice(wires.indexOf(this.connection), 1);
                this.connection = null;
            }
            this.connection = lastClickedOn.connection;
            this.connection.rozetka = this;
            lastClickedOn = null;
        }
    }
}
class Vilka extends JoinPoint {
    constructor(pos, color, my, id) {
        super(pos, color, my, id);
        this.img = vilkaImg;
        this.w = 30;
        this.h = 30;
    }
    OnClick(pos) {
        if (!super.OnClick(pos))
            return;
        if (lastClickedOn instanceof Vilka) {
            gameObjects.splice(gameObjects.indexOf(lastClickedOn.connection), 1);
            wires.splice(wires.indexOf(lastClickedOn.connection), 1);
            lastClickedOn.connection = null;
        }
        if (this.connection) {
            if (this.connection.rozetka)
                this.connection.rozetka.connection = null;
            gameObjects.splice(gameObjects.indexOf(this.connection), 1);
            wires.splice(wires.indexOf(this.connection), 1);
            this.connection = null;
        }
        lastClickedOn = this;
        this.connection = new Wire(this, null);
        gameObjects.push(this.connection);
        wires.push(this.connection);
    }
}
class Wire extends RenderObject {
    constructor(vilka, rozetka) {
        super();
        this.vilka = vilka;
        this.rozetka = rozetka;
    }
    Pos1() {
        return new Pos(this.vilka.pos.x + this.vilka.w / 2, this.vilka.pos.y + this.vilka.h / 2);
    }
    Pos2() {
        let pos2;
        if (this.rozetka)
            pos2 = new Pos(this.rozetka.pos.x + this.rozetka.w / 2, this.rozetka.pos.y + this.rozetka.h / 2);
        else
            pos2 = new Pos(mX, mY);
        return pos2;
    }
    Finished() {
        return !!this.rozetka;
    }
    Render() {
        let pos1 = this.Pos1();
        let pos2 = this.Pos2();
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.strokeStyle = this.vilka.color;
        ctx.stroke();
    }
}
class VWire extends Wire {
    constructor(pos2, id, rid, finished) {
        super();
        this.pos2 = new Pos(...pos2);
        this.vilka = gameObjects.filter(v => v instanceof Vilka && v.id == id && !v.my)[0];
        this.rozetka = finished && gameObjects.filter(v => v instanceof Rozetka && v.rid == rid && !v.my)[0];
    }
    Pos2() {
        if (this.rozetka)
            return new Pos(this.rozetka.pos.x + this.rozetka.w / 2, this.rozetka.pos.y + this.rozetka.h / 2);
        return this.pos2;
    }
}