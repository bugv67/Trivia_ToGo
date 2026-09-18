import React, { useState } from 'react';

function App() {
  // הגדרת משתנה ששומר את המצב הנוכחי של המשחק
  // 'start' = מסך פתיחה | 'playing' = מסך משחק | 'end' = מסך סיום
  const [gameState, setGameState] = useState('start');

  // פונקציה שתופעל כשנלחץ על כפתור "התחל משחק" ותשנה את המצב
  const startGame = () => {
    setGameState('playing');
  };

  return (
    // מעטפת ראשית המשתמשת ב-Tailwind CSS לעיצוב רספונסיבי, מרכוז למסך, וכיוון טקסט לעברית
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4" dir="rtl">
      
      {/* תצוגה מותנית: אם המצב הוא 'start', נציג את הבלוק הזה */}
      {gameState === 'start' && (
        <div className="text-center bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">טריוויה בעברית</h1>
          <p className="text-gray-600 mb-8">האם אתם מוכנים לבדוק את הידע שלכם?</p>
          <button 
            onClick={startGame}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            התחל משחק
          </button>
        </div>
      )}

      {/* תצוגה מותנית: אם המצב הוא 'playing', נציג את הבלוק הזה */}
      {gameState === 'playing' && (
        <div className="text-center bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">המשחק בפעולה!</h2>
          <p className="text-gray-600">כאן תופיע השאלה הראשונה בקרוב...</p>
        </div>
      )}

      {/* תצוגה מותנית: אם המצב הוא 'end', נציג את הבלוק הזה */}
      {gameState === 'end' && (
        <div className="text-center bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-green-600 mb-4">המשחק הסתיים</h2>
          <p className="text-gray-600">כאן יופיע הניקוד הסופי.</p>
        </div>
      )}

    </div>
  );
}

export default App;