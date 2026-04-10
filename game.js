let decks = {
    'level-a': [] // ברירת מחדל
};

let gameState = {
    players: [],
    currentPlayerIndex: 0,
    discardPile: [],
    mode: 'cpu',
    currentCardInWork: null
};

// --- ניהול קבצים וחפיסות ---

async function processZip() {
    const fileInput = document.getElementById('zip-upload');
    if (!fileInput.files[0]) return alert("אנא בחר קובץ ZIP");

    const zip = await JSZip.loadAsync(fileInput.files[0]);
    const deckData = { name: fileInput.files[0].name.replace('.zip',''), cards: [] };

    // חיפוש קובץ הנתונים בתוך ה-ZIP
    const jsonFile = zip.file("data.json");
    if (!jsonFile) return alert("חובה לכלול קובץ data.json בחבילה!");

    const jsonData = JSON.parse(await jsonFile.async("string"));

    // חילוץ תמונות
    for (const [fileName, file] of Object.entries(zip.files)) {
        if (fileName.endsWith('.png') || fileName.endsWith('.jpg')) {
            const base64 = await file.async("base64");
            const word = jsonData[fileName] || fileName.split('_')[1]?.split('.')[0];
            deckData.cards.push({
                src: `data:image/png;base64,${base64}`,
                word: word,
                color: fileName.split('_')[0]
            });
        }
    }

    decks[deckData.name] = deckData.cards;
    alert(`חפיסה ${deckData.name} נטענה בהצלחה!`);
    updateDeckList();
}

// --- לוגיקת המשחק ---

function setMode(m) {
    gameState.mode = m;
    document.getElementById('names-input').style.display = (m === 'pvp') ? 'block' : 'none';
}

function initGame() {
    const p1 = document.getElementById('p1-name').value || "שחקן 1";
    const p2 = (gameState.mode === 'cpu') ? "מחשב" : (document.getElementById('p2-name').value || "שחקן 2");
    
    gameState.players = [
        { name: p1, hand: [], isCPU: false },
        { name: p2, hand: [], isCPU: (gameState.mode === 'cpu') }
    ];

    // חלוקת 7 קלפים מכל החפיסות הטעונות
    const allAvailableCards = Object.values(decks).flat();
    gameState.players.forEach(p => {
        for(let i=0; i<7; i++) p.hand.push(getRandomCard(allAvailableCards));
    });

    gameState.discardPile = [getRandomCard(allAvailableCards)];
    
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'flex';
    
    startNextTurn();
}

function startNextTurn() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    // מודאל מעבר תור (כדי שלא יראו את הקלפים אחד של השני)
    const announcer = document.getElementById('turn-announcer');
    document.getElementById('next-player-name').innerText = `תור של: ${player.name}`;
    announcer.style.display = 'flex';
}

function startTurn() {
    document.getElementById('turn-announcer').style.display = 'none';
    renderGame();
}

function renderGame() {
    const player = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('current-display-name').innerText = player.name;
    
    // רינדור קלף שולחן
    const tableCard = gameState.discardPile[gameState.discardPile.length - 1];
    document.getElementById('discard-pile').innerHTML = `<img src="${tableCard.src}">`;

    // רינדור מניפה
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    player.hand.forEach((card, i) => {
        const img = document.createElement('img');
        img.src = card.src;
        img.className = 'card-image';
        // חישוב מניפה פשוט
        const offset = (i - (player.hand.length/2)) * 50;
        img.style.transform = `translateX(${offset}px)`;
        img.onclick = () => openQuestion(card);
        handDiv.appendChild(img);
    });
}

function openQuestion(card) {
    gameState.currentCardInWork = card;
    document.getElementById('question-img-container').innerHTML = `<img src="${card.src}" style="width:150px">`;
    document.getElementById('target-word-en').innerText = card.word.toUpperCase();
    document.getElementById('question-overlay').style.display = 'flex';

    // יצירת תשובות (נכון + 3 מסיחים)
    let options = [dictionary[card.word] || "תרגום", "בית", "כלב", "שמש"].sort(() => Math.random() - 0.5);
    const grid = document.getElementById('answers-grid');
    grid.innerHTML = '';
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, btn);
        grid.appendChild(btn);
    });
}

function checkAnswer(answer, btn) {
    const card = gameState.currentCardInWork;
    const tableCard = gameState.discardPile[gameState.discardPile.length - 1];
    const correctAnswer = dictionary[card.word];

    if (answer === correctAnswer) {
        btn.style.background = "green";
        // בדיקת חוקיות (צבע או מילה)
        if (card.color === tableCard.color || card.word === tableCard.word || card.color === 'special') {
            setTimeout(() => {
                executeMove(card);
            }, 500);
        } else {
            alert("התשובה נכונה, אבל הקלף לא מתאים לצבע או לאות!");
            endTurn();
        }
    } else {
        btn.style.background = "red";
        setTimeout(endTurn, 1000);
    }
}

function executeMove(card) {
    gameState.discardPile.push(card);
    const player = gameState.players[gameState.currentPlayerIndex];
    player.hand = player.hand.filter(c => c !== card);
    document.getElementById('question-overlay').style.display = 'none';
    endTurn();
}

function endTurn() {
    document.getElementById('question-overlay').style.display = 'none';
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    startNextTurn();
}

function drawCard() {
    const allAvailableCards = Object.values(decks).flat();
    const player = gameState.players[gameState.currentPlayerIndex];
    player.hand.push(getRandomCard(allAvailableCards));
    endTurn();
}

function speakWord() {
    const msg = new SpeechSynthesisUtterance(gameState.currentCardInWork.word);
    msg.lang = 'en-US';
    window.speechSynthesis.speak(msg);
}

function getRandomCard(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function showSection(id) {
    ['main-menu', 'player-setup', 'deck-manager'].forEach(s => document.getElementById(s).style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

const dictionary = { "Sit": "לשבת", "Dog": "כלב", "Apple": "תפוח" }; // להרחיב לפי הצורך