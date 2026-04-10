let gameState = {
    mode: 'cpu',
    players: [],
    currentPlayer: 0,
    deck: [],
    discardPile: []
};

// קלפים לדוגמה (יש להחליף בנתיבים האמיתיים שלך)
const deckSource = [
    {word: 'Apple', color: 'green', src: 'cards/apple.png'},
    {word: 'Dog', color: 'blue', src: 'cards/dog.png'},
    {word: 'Sun', color: 'yellow', src: 'cards/sun.png'},
    {word: 'Red', color: 'red', src: 'cards/red.png'}
];

function showModal(type) {
    const modal = document.getElementById('info-modal');
    const title = document.getElementById('info-title');
    const text = document.getElementById('info-text');
    
    if(type === 'rules') {
        title.innerText = "איך משחקים?";
        text.innerText = "התאם צבע או מילה לקלף שעל השולחן. ענה נכון על השאלה כדי להניח את הקלף. הראשון שגומר את הקלפים מנצח!";
    } else if (type === 'admin') {
        title.innerText = "ניהול חפיסות";
        text.innerText = "כאן תוכל להעלות קבצי ZIP בעתיד.";
    }
    modal.style.display = 'flex';
}

function closeModal() { document.getElementById('info-modal').style.display = 'none'; }

function setMode(mode) {
    gameState.mode = mode;
    if(mode === 'pvp') {
        document.getElementById('menu-main').style.display = 'none';
        document.getElementById('names-input').style.display = 'flex';
    } else {
        gameState.players = [
            {name: 'אתה', hand: [], isCPU: false},
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
    // יצירת חפיסה
    gameState.deck = [];
    for(let i=0; i<10; i++) gameState.deck.push(...deckSource);
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
    
    // אם זה מחשב, או אם זה PvP אבל השחקן הראשון מתחיל - לא תמיד צריך מודאל
    if (gameState.mode === 'cpu' && player.isCPU) {
        renderBoard(true); // תצוגה מוסתרת
        setTimeout(handleCPU, 1500);
    } else if (gameState.mode === 'pvp') {
        document.getElementById('next-player-name').innerText = player.name;
        document.getElementById('turn-modal').style.display = 'flex';
    } else {
        renderBoard();
    }
}

function revealHand() {
    document.getElementById('turn-modal').style.display = 'none';
    renderBoard();
}

function renderBoard(isHideCurrent = false) {
    const player = gameState.players[gameState.currentPlayer];
    const opponent = gameState.players[(gameState.currentPlayer + 1) % 2];
    
    document.getElementById('current-player-display').innerText = player.name;

    // קלף שולחן
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    document.getElementById('discard-pile').innerHTML = `<img src="${topCard.src}" class="card-image">`;

    // מניפת שחקן
    const playerHandDiv = document.getElementById('player-hand');
    playerHandDiv.innerHTML = '';
    player.hand.forEach((card, i) => {
        const img = document.createElement('img');
        img.src = isHideCurrent ? 'card_back.jpg' : card.src;
        img.className = 'card-image';
        
        // חישוב מניפה
        const angle = (i - (player.hand.length/2)) * 10;
        const x = (i - (player.hand.length/2)) * 30;
        img.style.transform = `translateX(${x}px) rotate(${angle}deg)`;
        img.style.zIndex = i;
        
        if(!isHideCurrent) img.onclick = () => playCard(card);
        playerHandDiv.appendChild(img);
    });

    // מניפת יריב (תמיד גב הקלף)
    const oppHandDiv = document.getElementById('opponent-hand');
    oppHandDiv.innerHTML = '';
    opponent.hand.forEach((_, i) => {
        const img = document.createElement('img');
        img.src = 'card_back.jpg';
        img.className = 'card-back-img';
        const angle = (i - (opponent.hand.length/2)) * 8;
        const x = (i - (opponent.hand.length/2)) * 25;
        // במניפת יריב הופכים את הזווית
        img.style.transform = `translateX(${x}px) rotate(${180 - angle}deg)`;
        oppHandDiv.appendChild(img);
    });
}

function playCard(card) {
    // כאן תוסיף את מודאל השאלה. לצורך הבדיקה:
    gameState.discardPile.push(card);
    const p = gameState.players[gameState.currentPlayer];
    p.hand = p.hand.filter(c => c !== card);
    
    if(p.hand.length === 0) {
        alert(p.name + " ניצח!");
        location.reload();
        return;
    }
    nextTurn();
}

function nextTurn() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % 2;
    startTurn();
}

function drawCard() {
    gameState.players[gameState.currentPlayer].hand.push(gameState.deck.pop());
    nextTurn();
}

function handleCPU() {
    // לוגיקת מחשב פשוטה
    drawCard();
}
