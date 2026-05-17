import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { Question } from './models/Question';
import questionsData from './data/questions.json';

export default function App() {
  // טוענים את השאלה הראשונה מתוך הקובץ
  const currentQuestion: Question = questionsData[0];
  
  // משתנה מצב ששומר האם המשתמש כבר ענה על השאלה
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);

  // הפונקציה שמופעלת בלחיצה על תשובה
  const handleAnswerPress = (selectedIndex: number) => {
    setHasAnswered(true);
    
    if (selectedIndex === currentQuestion.correctIndex) {
      Alert.alert("בול!", "תשובה נכונה.");
    } else {
      Alert.alert("טעות...", "לא נורא, נסה שוב.");
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      {/* הצגת השאלה */}
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        {currentQuestion.question}
      </Text>

      {/* יצירת כפתור לכל אחת מהתשובות */}
      {currentQuestion.options.map((option, index) => (
        <View key={index} style={{ marginVertical: 5 }}>
          <Button 
            title={option} 
            onPress={() => handleAnswerPress(index)} 
            disabled={hasAnswered} // נועל את הכפתורים אחרי שעונים
          />
        </View>
      ))}

      {/* הצגת הרחבת הידע רק אחרי שהמשתמש ענה */}
      {hasAnswered && (
        <Text style={{ marginTop: 20, fontSize: 16, color: 'gray' }}>
          💡 הרחבת ידע: {currentQuestion.extraKnowledge}
        </Text>
      )}
    </View>
  );
}