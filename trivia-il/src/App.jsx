import React, { useState, useEffect } from 'react';
// Added missing addDoc, and query functions (query, orderBy, limit) for the top 5 leaderboard
import { collection, getDocs, addDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { triviaQuestions } from './questions'; // Fallback local data

function App() {
  // State to manage the current screen ('start', 'playing', 'end')
  const [gameState, setGameState] = useState('start');
  
  // State to track the current question index and count
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [count, setCount] = useState(0);
  
  // State to track the user's score
  const [score, setScore] = useState(0);

  // States to manage user selection and button locking during delay
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);

  // States for data fetching (Questions)
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for Leaderboard management
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isScoreSaved, setIsScoreSaved] = useState(false);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false); // Tracks leaderboard fetch status
const [activeQuestions, setActiveQuestions] = useState([]);
  // Fetch questions once when the app loads
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questions"));
        const fetchedData = querySnapshot.docs.map(doc => doc.data());
        
        // Trigger fallback if the database returns an empty array
        if (fetchedData.length === 0) throw new Error("No data found in Firebase");
        
        setQuestions(fetchedData); 
        setIsLoading(false); 
      } catch (error) {
        console.error("Error fetching from Firebase, loading local fallback:", error);
        // Fallback to local questions file
        setQuestions(triviaQuestions);
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Fetch Top 5 scores from Firestore
  const fetchTopScores = async () => {
    setIsLeaderboardLoading(true);
    try {
      const leaderboardRef = collection(db, "leaderboard");
      // Query to get the top 5 scores in descending order
      const q = query(leaderboardRef, orderBy("score", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      
      const data = querySnapshot.docs.map(doc => doc.data());
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  // Automatically fetch leaderboard data when the game ends
  useEffect(() => {
    if (gameState === 'end') {
      fetchTopScores();
    }
  }, [gameState]);

  const saveScoreToLeaderboard = async () => {
    // Prevent double saving or saving without a name
    if (!playerName.trim() || isScoreSaved) return;

    try {
      // Create a new document in the "leaderboard" collection
      await addDoc(collection(db, "leaderboard"), {
        name: playerName,
        score: score,
        date: new Date().toISOString() // Saves current timestamp
      });
      
      setIsScoreSaved(true); 
      
      // Re-fetch the leaderboard to instantly show the newly saved score if it made the Top 5
      fetchTopScores();
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};
  const startGame = () => {

    setGameState('playing');
    const mixedQuestions = shuffleArray(questions).slice(0, 25);
  setActiveQuestions(mixedQuestions);
    setCurrentQuestionIndex(0); 
    setCount(1);
    
    // Reset score and waiting states when a new game starts
    setScore(0);
    setSelectedAnswer(null);
    setIsWaiting(false);
    
    // Reset leaderboard input states
    setPlayerName('');
    setIsScoreSaved(false);
  };

  // Get the current question from the state
 const currentQuestion = activeQuestions[currentQuestionIndex];

  const handleAnswerClick = (selectedOption) => {
    // Prevent multiple clicks
    if (isWaiting) return;

    // Save the selected answer
    setSelectedAnswer(selectedOption);
    setIsWaiting(true);

    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(score + 1); 
    }

    setTimeout(() => {
     const nextQuestion = currentQuestionIndex + 1;

      // Check if we haven't reached 25 questions yet
      if (count < 25) {
        setCount(count + 1); 
        setCurrentQuestionIndex(nextQuestion); 
      } else {
        setGameState('end');
      }

      setSelectedAnswer(null);
      setIsWaiting(false);
    }, 2000);
  };

  const handleColor = (option) => {
    // Base styling shared by all buttons in all states
    const baseClass = "w-full font-medium py-3 px-4 rounded-lg transition-colors text-right border ";

    // If we are in the waiting state (after a click)
    if (isWaiting) {
      if (option === currentQuestion.correctAnswer) {
        // The correct answer is always highlighted in green
        return baseClass + "bg-green-100 border-green-500 text-green-800";
      }
      if (option === selectedAnswer) {
        // If the user selected this wrong answer, highlight it in red
        return baseClass + "bg-red-100 border-red-500 text-red-800";
      }
      // Other unselected buttons are slightly faded
      return baseClass + "bg-gray-50 border-gray-200 text-gray-400 opacity-50"; 
    }

    // Default state 
return baseClass + "bg-gray-50 active:bg-gray-200 border-gray-200 text-gray-700";
  };

  // Render loading screen if data is still being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4" dir="rtl">
        <h2 className="text-2xl font-bold text-gray-700">Loading questions...</h2>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4" dir="rtl">
      
      {/* Start Screen */}
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

      {/* Playing Screen */}
      {gameState === 'playing' && (
        <div className="text-center bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <p className="text-sm text-gray-500 mb-2">
            שאלה {count} מתוך 25
          </p>
          
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            {currentQuestion.question}
          </h2>
          
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option, index) => (
              <button 
                key={index}
                onClick={() => handleAnswerClick(option)}
                disabled={isWaiting}
                className={handleColor(option)}
               >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* End Scree n */}
      {gameState === 'end' && (
        <div className="text-center bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-green-600 mb-4">המשחק הסתיים</h2>
          <p className="text-gray-800 font-medium mb-6">
            ענית נכון על {score} מתוך 25 שאלות!
          </p>

          {/* Leaderboard Score Saving Section */}
          {!isScoreSaved ? (
            <div className="mb-8 flex flex-col gap-3">
              <input
                type="text"
                placeholder="הכניסי את שמך..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 text-right focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={saveScoreToLeaderboard}
                disabled={!playerName.trim()}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                שמרי תוצאה בטבלת המובילים
              </button>
            </div>
          ) : (
            <p className="text-green-600 font-bold mb-8">התוצאה נשמרה בהצלחה!</p>
          )}

          {/* Top 5 Leaderboard Display */}
          <div className="mb-8 border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 טופ 5 מובילים</h3>
            
            {isLeaderboardLoading ? (
              <p className="text-gray-500">טוען נתונים...</p>
            ) : leaderboard.length > 0 ? (
              <table className="w-full text-right bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-blue-100 text-blue-800">
                  <tr>
                    <th className="py-2 px-4 font-semibold">מקום</th>
                    <th className="py-2 px-4 font-semibold">שם</th>
                    <th className="py-2 px-4 font-semibold text-left">ניקוד</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={index} className="border-b border-gray-200 last:border-0">
                      <td className="py-2 px-4 text-gray-600 font-medium">{index + 1}</td>
                      <td className="py-2 px-4 text-gray-800">{entry.name}</td>
                      <td className="py-2 px-4 text-blue-600 font-bold text-left">{entry.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">עדיין אין מובילים. היי הראשונה לשמור תוצאה!</p>
            )}
          </div>

          <button 
            onClick={startGame}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            שחק שוב
          </button>
        </div>
      )}

    </div>
  );
}

export default App;