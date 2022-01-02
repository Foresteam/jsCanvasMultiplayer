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

RoomListListen(rooms => {
    let list = document.querySelector('#room-list');
    let t = '';
    for (let [id, { players }] of rooms)
        t += `
			<tr class="item">
				<td style="text-align: left; width: 50%">#${id}</td>
				<td style="text-align: center;">${players}/2</td>
				<td style="text-align: center;">${players < 2 ? 'Ожидание' : 'Идет игра'}</td>
				<td align="center"><input type="button" value="Присоединиться" onclick="Join(${id})"></td>
			</tr>
		`;
    list.innerHTML = t;
});

document.getElementById('#create-join-menu input').onclick = () => {
    SelectChild(document.querySelector('#lobby'), '#create-wait');
    Networking('create');
}
document.querySelector('#create-wait input').onclick = () => {
    location = location;
}