// הגדרות בסיס - שנה כאן את שמות הקבצים שיש לך בתיקייה
const cardFiles = [
    {src: 'cards/level-a/green_apple.png', word: 'Apple', color: 'green', heb: 'תפוח'},
    {src: 'cards/level-a/blue_dog.png', word: 'Dog', color: 'blue', heb: 'כלב'},
    {src: 'cards/level-a/red_sit.png', word: 'Sit', color: 'red', heb: 'לשבת'},
    {src: 'cards/level-a/yellow_sun.png', word: 'Sun', color: 'yellow', heb: 'שמש'}
];

let gameState = {
    players: [],
    currentPlayer: 0,
    discardPile: [],
    deck: [],
    selectedCard: null
};

function setMode(mode) {
    if(mode === 'cpu') {
        gameState.players = [{name: 'שחקן', hand: [], isCPU: false}, {name: 'מחשב', hand: [], isCPU: true}];
    } else {
        gameState.players = [{name: 'שחקן 1', hand: [], isCPU: false}, {name: 'שחקן 2', hand: [], isCPU: false}];
    }
    initGame();
}

function initGame() {
    // יצירת חפיסה (לוגיקה פשוטה לצורך הבדיקה)
    gameState.deck = [...cardFiles, ...cardFiles, ...cardFiles].sort(() => Math.random() - 0.5);
    
    // חלוקת 7 קלפים
    gameState.players.forEach(p => {
        p.hand = gameState.deck.splice(0, 7);
    });

    gameState.discardPile = [gameState.deck.splice(0, 1)[0]];
    
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'flex';
    
    showTurnModal();
}

function showTurnModal() {
    const player = gameState.players[gameState.currentPlayer];
    if (player.isCPU) {
        handleCPUTurn();
    } else {
        document.getElementById('turn-modal').style.display = 'flex';
        document.getElementById('next-player-name').innerText = `תור של: ${player.name}`;
    }
}

function revealHand() {
    document.getElementById('turn-modal').style.display = 'none';
    renderBoard();
}

function renderBoard() {
    const player = gameState.players[gameState.currentPlayer];
    document.getElementById('player-label').innerText = `תור: ${player.name}`;
    
    // קלף שולחן
    const lastCard = gameState.discardPile[gameState.discardPile.length - 1];
    document.getElementById('discard-pile').innerHTML = `<img src="${lastCard.src}" class="card-image">`;

    // יד שחקן
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    player.hand.forEach((card, i) => {
        const img = document.createElement('img');
        img.src = card.src;
        img.className = 'card-image hand-card';
        // אפקט מניפה
        const offset = (i - (player.hand.length / 2)) * 40;
        const angle = (i - (player.hand.length / 2)) * 5;
        img.style.transform = `translateX(${offset}px) rotate(${angle}deg)`;
        img.onclick = () => openQuestion(card);
        handDiv.appendChild(img);
    });
}

function openQuestion(card) {
    gameState.selectedCard = card;
    document.getElementById('question-img-container').innerHTML = `<img src="${card.src}" style="width:120px">`;
    document.getElementById('target-word-en').innerText = card.word.toUpperCase();
    
    const correct = card.heb;
    let options = [correct, "בית", "חתול", "ספר"].sort(() => Math.random() - 0.5);
    
    const grid = document.getElementById('answers-grid');
    grid.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, btn, correct);
        grid.appendChild(btn);
    });
    
    document.getElementById('question-overlay').style.display = 'flex';
}

function checkAnswer(selected, btn, correct) {
    if (selected === correct) {
        btn.style.background = "#2ecc71";
        const tableCard = gameState.discardPile[gameState.discardPile.length - 1];
        
        // בדיקת חוקיות טאקי (צבע או מילה)
        if (gameState.selectedCard.color === tableCard.color || gameState.selectedCard.word === tableCard.word) {
            setTimeout(completeMove, 600);
        } else {
            alert("תשובה נכונה! אבל הקלף לא מתאים לצבע או לאות שעל השולחן.");
            setTimeout(nextTurn, 600);
        }
    } else {
        btn.style.background = "#e74c3c";
        alert(`טעות. התשובה הנכונה היא: ${correct}`);
        setTimeout(nextTurn, 1000);
    }
}

function completeMove() {
    const player = gameState.players[gameState.currentPlayer];
    gameState.discardPile.push(gameState.selectedCard);
    player.hand = player.hand.filter(c => c !== gameState.selectedCard);
    
    document.getElementById('question-overlay').style.display = 'none';
    if(player.hand.length === 0) return alert(player.name + " ניצח!");
    nextTurn();
}

function drawCard() {
    if (gameState.deck.length > 0) {
        const card = gameState.deck.pop();
        gameState.players[gameState.currentPlayer].hand.push(card);
        nextTurn();
    }
}

function nextTurn() {
    document.getElementById('question-overlay').style.display = 'none';
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    showTurnModal();
}

function speakCurrentWord() {
    const msg = new SpeechSynthesisUtterance(gameState.selectedCard.word);
    msg.lang = 'en-US';
    window.speechSynthesis.speak(msg);
}

function handleCPUTurn() {
    const cpu = gameState.players[gameState.currentPlayer];
    // לוגיקה פשוטה למחשב
    setTimeout(() => {
        cpu.hand.pop(); // סתם זורק קלף לצורך הבדיקה
        nextTurn();
    }, 1500);
}

function showRules() { alert("התאם צבע או מילה. ענה נכון על השאלה כדי להניח את הקלף."); }
function openAdmin() { alert("כאן תוכל לטעון חפיסות ZIP בעתיד."); }
