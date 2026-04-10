let gameState = {
    mode: 'cpu',
    players: [],
    currentPlayer: 0,
    deck: [],
    discardPile: []
};

// קלפים - וודא שהנתיבים תואמים לקבצים שלך
const cardData = [
    {word: 'Snake', color: 'pink', src: 'cards/snake.png'},
    {word: 'Red', color: 'red', src: 'cards/red.png'},
    {word: 'Apple', color: 'green', src: 'cards/apple.png'}
];

function openInfoModal(type) {
    const modal = document.getElementById('info-modal');
    const title = document.getElementById('modal-title');
    const text = document.getElementById('modal-text');
    
    if(type === 'rules') {
        title.innerText = "איך משחקים?";
        text.innerText = "התאם צבע או מילה. ענה נכון כדי להניח קלף. הראשון שגומר את הקלפים מנצח!";
    } else {
        title.innerText = "ניהול";
        text.innerText = "אזור ניהול חפיסות ZIP יהיה זמין בגרסאות הבאות.";
    }
    modal.style.display = 'flex';
}

function closeInfoModal() { document.getElementById('info-modal').style.display = 'none'; }

function setMode(mode) {
    gameState.mode = mode;
    if(mode === 'pvp') {
        document.getElementById('menu-main').style.display = 'none';
        document.getElementById('names-input').style.display = 'flex';
    } else {
        gameState.players = [
            {name: 'שחקן', hand: [], isCPU: false},
            {name: 'מחשב', hand: [], isCPU: true}
        ];
        startGame();
    }
}

function startPVP() {
    const p1 = document.getElementById('p1-name').value || "שחקן 1";
    const p2 = document.getElementById('p2-name').value || "שחקן 2";
    gameState.players = [
        {name: p1, hand: [], isCPU: false},
        {name: p2, hand: [], isCPU: false}
    ];
    startGame();
}

function startGame() {
    // בניית חפיסה
    gameState.deck = [];
    for(let i=0; i<15; i++) gameState.deck.push(...cardData);
    gameState.deck.sort(() => Math.random() - 0.5);

    // חלוקה
    gameState.players.forEach(p => p.hand = gameState.deck.splice(0, 7));
    gameState.discardPile = [gameState.deck.pop()];

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'flex';
    
    startTurn();
}

function startTurn() {
    const player = gameState.players[gameState.currentPlayer];
    if (gameState.mode === 'pvp') {
        document.getElementById('turn-instruction').innerText = `נא להעביר את המכשיר אל ${player.name}`;
        document.getElementById('turn-modal').style.display = 'flex';
    } else if (player.isCPU) {
        renderBoard(true);
        setTimeout(handleCPU, 1500);
    } else {
        renderBoard();
    }
}

function revealHand() {
    document.getElementById('turn-modal').style.display = 'none';
    renderBoard();
}

function renderBoard(hideCurrent = false) {
    const player = gameState.players[gameState.currentPlayer];
    const opponent = gameState.players[(gameState.currentPlayer + 1) % 2];

    // קלף שולחן (מאונך)
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    document.getElementById('discard-pile').innerHTML = `<img src="${topCard.src}" class="card-image">`;

    // יד שחקן (מניפה)
    const pHand = document.getElementById('player-hand');
    pHand.innerHTML = '';
    player.hand.forEach((card, i) => {
        const img = document.createElement('img');
        img.src = hideCurrent ? 'card_back.jpg' : card.src;
        img.className = 'card-image hand-card';
        const angle = (i - (player.hand.length/2)) * 8;
        const x = (i - (player.hand.length/2)) * 35;
        img.style.transform = `translateX(${x}px) rotate(${angle}deg)`;
        img.onclick = () => { if(!hideCurrent) playCard(card); };
        pHand.appendChild(img);
    });

    // יד יריב (גב קלף)
    const oHand = document.getElementById('opponent-hand');
    oHand.innerHTML = '';
    opponent.hand.forEach((_, i) => {
        const img = document.createElement('img');
        img.src = 'card_back.jpg';
        img.className = 'card-back-img hand-card';
        const angle = (i - (opponent.hand.length/2)) * 6;
        const x = (i - (opponent.hand.length/2)) * 25;
        img.style.transform = `translateX(${x}px) rotate(${180 - angle}deg)`;
        oHand.appendChild(img);
    });
}

function playCard(card) {
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (card.color === topCard.color || card.word === topCard.word) {
        gameState.discardPile.push(card);
        const p = gameState.players[gameState.currentPlayer];
        p.hand = p.hand.filter(c => c !== card);
        if(p.hand.length === 0) return alert(p.name + " ניצח!");
        nextTurn();
    }
}

function drawCard() {
    if(gameState.deck.length > 0) {
        gameState.players[gameState.currentPlayer].hand.push(gameState.deck.pop());
        nextTurn();
    }
}

function nextTurn() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % 2;
    startTurn();
}

function handleCPU() {
    drawCard();
}
