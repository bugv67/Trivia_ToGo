import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
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

  // States for  data fetching
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // מעקב אחרי השם שהמשתמש מקליד
  const [playerName, setPlayerName] = useState('');
  // שמירת נתוני טבלת המובילים מהשרת
  const [leaderboard, setLeaderboard] = useState([]);
  // חסימת כפתור השמירה אחרי לחיצה כדי למנוע שמירות כפולות
  const [isScoreSaved, setIsScoreSaved] = useState(false);

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

  const getNextQuestionIndex = () => {
    // Generate a random index based on the actual loaded questions array
    return Math.floor(Math.random() * questions.length);
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestionIndex(getNextQuestionIndex()); 
    setCount(1);
    // Reset score when a new game starts
    setScore(0);
    // Reset waiting states in case of a restart
    setSelectedAnswer(null);
    setIsWaiting(false);
    setPlayerName('');
    setIsScoreSaved(false);
  };

  // Get the current question from the state
  const currentQuestion = questions[currentQuestionIndex];

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
      const nextQuestion = getNextQuestionIndex();

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
    return baseClass + "bg-gray-50 hover:bg-blue-50 border-gray-200 text-gray-700";
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

      {/* End Screen */}
      {gameState === 'end' && (
        <div className="text-center bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-green-600 mb-4">המשחק הסתיים</h2>
          <p className="text-gray-800 font-medium mb-8">
            ענית נכון על {score} מתוך 25 שאלות!
          </p>
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