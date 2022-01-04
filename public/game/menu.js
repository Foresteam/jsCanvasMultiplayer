/**
 * 
 * @param {HTMLElement} parent 
 * @param {string} toShow Child query selector
 */
const SelectChild = (parent, toShow) => {
    for (let child of parent.children)
        child.setAttribute('hidden', '');
    parent.querySelector(toShow).removeAttribute('hidden');
}
/**
 * @param {string} status New status (title)
 */
const TITLE = 'The Conductor';
const SetStatus = status => document.querySelectorAll('.status').forEach(v => v.innerText = `${TITLE} - ${status}`);

RoomListListen(rooms => {
    let list = document.querySelector('#room-list');
    let t = '';
    if (rooms.length == 0)
        t = 'I see no rooms :( So yours can be the first!';
    else
        for (let [id, { players }] of rooms)
            t += `
                <tr class="item">
                    <td style="text-align: left; width: 50%">#${id}</td>
                    <td style="text-align: center;">${players}/2</td>
                    <td style="text-align: center;">${players < 2 ? 'Waiting...' : 'Game in progress'}</td>
                    <td align="center"><input type="button" value="Join" onclick="Join(${id})"></td>
                </tr>
            `;
    list.innerHTML = t;
});

document.querySelector('#create-join-menu input').onclick = () => {
    SelectChild(document.querySelector('#lobby'), '#create-wait');
    Networking('create');
    SetStatus('Waiting for another player');
}
document.querySelector('#create-wait input').onclick = () => {
    location = location;
}

setInterval(() => {
    for (let v of document.querySelectorAll('.animated-dots')) {
        let dots = v.innerText;
        if (v.innerText.length >= v.getAttribute('count'))
            dots = '';
        dots += '.';
        v.innerText = dots;
    }
}, 400);