// אתחול מצב משחק
let gameState = {
    mode: 'cpu',
    players: [],
    currentPlayerIndex: 0
};

function setMode(mode) {
    console.log("Setting mode to:", mode);
    gameState.mode = mode;
    
    // בדיקה אם האלמנט קיים לפני שינוי סטייל כדי למנוע את שגיאת ה-TypeError
    const namesInput = document.getElementById('names-input');
    if (namesInput) {
        namesInput.style.display = (mode === 'pvp') ? 'block' : 'none';
    }

    // אם אנחנו ב-CPU או PVP פשוט נתחיל כרגע כדי לבדוק שהכפתור עובד
    initGame();
}

function showRules() {
    alert("חוקי המשחק: התאם צבע או אות, ענה נכון על השאלה והיה הראשון לסיים את הקלפים!");
}

function openAdmin() {
    alert("מסך ניהול: כאן תוכל להעלות חפיסות ZIP בקרוב.");
}

function initGame() {
    console.log("Game Starting...");
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'flex';
    
    // כאן תבוא לוגיקת חלוקת הקלפים
}

// פונקציות עזר למניעת שגיאות לחיצה
function drawCard() { console.log("Drawing card..."); }
