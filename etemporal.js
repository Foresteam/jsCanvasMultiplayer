const fs = require('fs');

class DB { // mongo for beggars
    constructor(file) {
        this.path = file;
        try {
            this.self = JSON.parse(fs.readFileSync(file, 'utf-8'));
        }
        catch {
            this.self = [];
        }
    }
    save() {
        fs.writeFileSync(this.path, JSON.stringify(this.self, null, 4), 'utf-8');
    }
}
class SocketMaster { // Socket manager. No comments
    constructor() {
        this.slaves = [];
        this.nslave = 0;
    }
    broadcast(msg) {
        if (typeof msg == 'object')
            msg = JSON.stringify(msg);
        else if (typeof msg != 'string')
            msg = String(msg);

        for (let slave of this.slaves)
            if (slave.alive)
                slave.send(msg);
    }
    punish() {
        let bastards = [];
        for (let islave in this.slaves)
            if (!this.slaves[islave].alive)
                bastards.push(islave);
        for (let ibastard of bastards.reverse())
            this.slaves.splice(ibastard, 1);
    }
    enslave(slave, onClose) {
        this.punish();
        slave.id = this.nslave;
        slave.alive = true;
        slave.onclose = () => {
            slave.alive = false;
            onClose(slave.id);
        }
        this.nslave++;
        this.slaves.push(slave);
        return slave;
    }
}
module.exports = {
    DB, SocketMaster
}