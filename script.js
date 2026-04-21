let pHP = 50, eHP = 50;
let deck = [
    {type: '剪刀', val: 2}, {type: '剪刀', val: 3},
    {type: '石頭', val: 2}, {type: '石頭', val: 3},
    {type: '布', val: 2}, {type: '布', val: 3}
];
let hand = [];
let battleCount = 0;
let totalBattles = 0;
let isDrafting = false;

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-button').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        initGame();
    });
});

function initGame() {
    pHP = 50; eHP = 50; battleCount = 0; totalBattles = 0;
    document.getElementById('p-hp').innerText = pHP;
    document.getElementById('e-hp').innerText = eHP;
    drawHand();
}

function generateRandomCard() {
    let min, max;
    if (totalBattles < 3) { min = 2; max = 4; }
    else if (totalBattles < 6) { min = 3; max = 6; }
    else { min = 4; max = 7; }
    
    const types = ['剪刀', '石頭', '布', '萬能'];
    return { type: types[Math.floor(Math.random()*4)], val: Math.floor(Math.random() * (max - min + 1)) + min };
}

function drawHand() {
    hand = [];
    let tempDeck = [...deck];
    for(let i=0; i<5 && tempDeck.length > 0; i++) {
        let idx = Math.floor(Math.random() * tempDeck.length);
        hand.push(tempDeck.splice(idx, 1)[0]);
    }
    renderHand();
}

function renderHand() {
    const area = document.getElementById('hand-area');
    area.innerHTML = '';
    if (isDrafting) return;
    hand.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<div>${card.type}</div><div>${card.val}</div>`;
        div.onclick = () => play(index);
        area.appendChild(div);
    });
}

function play(index) {
    if (isDrafting) return;
    const pCard = hand[index];
    const eCard = generateRandomCard();
    
    document.getElementById('p-card-slot').innerHTML = `<div class="card">${pCard.type}<br>${pCard.val}</div>`;
    document.getElementById('e-card-slot').innerHTML = `<div class="card">${eCard.type}<br>${eCard.val}</div>`;

    let msg = `我方 ${pCard.type}(${pCard.val}) vs 敵方 ${eCard.type}(${eCard.val}) - `;
    
    if (pCard.type === '萬能' && eCard.type !== '萬能') { eHP -= pCard.val; msg += `萬能壓制！造成 ${pCard.val} 傷害`; }
    else if (eCard.type === '萬能' && pCard.type !== '萬能') { pHP -= eCard.val; msg += `敵方萬能！受到 ${eCard.val} 傷害`; }
    else if (pCard.type === eCard.type) {
        if (pCard.val > eCard.val) { eHP -= (pCard.val - eCard.val); msg += `平手比大！造成 ${pCard.val - eCard.val} 傷害`; }
        else if (eCard.val > pCard.val) { pHP -= (eCard.val - pCard.val); msg += `平手比大！受到 ${eCard.val - pCard.val} 傷害`; }
        else msg += "平手，無傷";
    } else {
        const win = (pCard.type==='剪刀'&&eCard.type==='布') || (pCard.type==='石頭'&&eCard.type==='剪刀') || (pCard.type==='布'&&eCard.type==='石頭');
        win ? (eHP -= pCard.val, msg += `獲勝！造成 ${pCard.val} 傷害`) : (pHP -= eCard.val, msg += `落敗！受到 ${eCard.val} 傷害`);
    }

    document.getElementById('p-hp').innerText = Math.max(0, pHP);
    document.getElementById('e-hp').innerText = Math.max(0, eHP);
    document.getElementById('log').innerText = msg;

    hand.splice(index, 1);
    totalBattles++;
    battleCount++;

    if (pHP <= 0 || eHP <= 0) {
        alert(pHP <= 0 ? "你輸了！" : "你贏了！");
        location.reload();
    } else if (battleCount >= 3) {
        isDrafting = true;
        startDrafting();
    } else {
        renderHand();
    }
}

function startDrafting() {
    document.getElementById('log').innerText = "抽牌階段：選擇一張牌加入牌庫 (萬能不限，剪刀石頭布每種最多重複兩張)";
    const area = document.getElementById('hand-area');
    area.innerHTML = '';
    
    let draftOptions = [];
    let counts = { '剪刀': 0, '石頭': 0, '布': 0 };
    deck.forEach(c => { if(c.type !== '萬能') counts[c.type]++; });

    while (draftOptions.length < 3) {
        const type = ['剪刀', '石頭', '布', '萬能'][Math.floor(Math.random()*4)];
        if (type !== '萬能' && counts[type] >= 2) continue;
        const card = generateRandomCard();
        card.type = type;
        draftOptions.push(card);
        if (type !== '萬能') counts[type]++;
    }

    draftOptions.forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<div>${card.type}</div><div>${card.val}</div>`;
        div.onclick = () => addCard(card);
        area.appendChild(div);
    });
}

function addCard(newCard) {
    if (deck.length >= 12) {
        document.getElementById('log').innerText = "牌庫已滿！點選一張牌棄掉以換取新牌：";
        renderDeckForDiscard(newCard);
    } else {
        deck.push(newCard);
        endDrafting();
    }
}

function renderDeckForDiscard(newCard) {
    const area = document.getElementById('hand-area');
    area.innerHTML = '';
    deck.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<div>${card.type}</div><div>${card.val}</div>`;
        div.onclick = () => {
            deck.splice(index, 1);
            deck.push(newCard);
            endDrafting();
        };
        area.appendChild(div);
    });
}

function endDrafting() {
    isDrafting = false;
    battleCount = 0;
    document.getElementById('log').innerText = "新卡牌已加入牌庫！新的決鬥開始。";
    drawHand();
}