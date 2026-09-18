import React, { useState } from 'react';
import { triviaQuestions } from './questions';

function App() {
  // State to manage the current screen ('start', 'playing', 'end')
  const [gameState, setGameState] = useState('start');
  // State to track the current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // State to track the user's score
  const [score, setScore] = useState(0);

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestionIndex(0); 
    // Reset score when a new game starts
    setScore(0);
  };

  const currentQuestion = triviaQuestions[currentQuestionIndex];

  const handleAnswerClick = (selectedOption) => {
    // Check if the selected answer is correct
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(score + 1); 
    }

    // Calculate the index for the next question
    const nextQuestion = currentQuestionIndex + 1;

    // Check if there are more questions left
    if (nextQuestion < triviaQuestions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      // End the game if no questions are left
      setGameState('end');
    }
  };

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
            שאלה {currentQuestionIndex + 1} מתוך {triviaQuestions.length}
          </p>
          
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            {currentQuestion.question}
          </h2>
          
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option, index) => (
              <button 
                key={index}
                onClick={() => handleAnswerClick(option)}
                className="w-full bg-gray-50 hover:bg-blue-50 border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors text-right"
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
            ענית נכון על {score} מתוך {triviaQuestions.length} שאלות!
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