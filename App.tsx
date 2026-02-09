import React, { useEffect, useState } from 'react';
import { UserState, AppScreen, Sender, SurveyResponse } from './types';
import { 
  loadUserState, 
  saveUserState, 
  getOrCreateTodaySession, 
  addMessageToSession, 
  getTodayString,
  markSurveyCompleted 
} from './services/storage';

// Screens
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';
import SurveyScreen from './components/SurveyScreen';
import CompletionScreen from './components/CompletionScreen';

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>({ id: null, sessions: {} });
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LOGIN);

  // Initialize App
  useEffect(() => {
    const loaded = loadUserState();
    setUserState(loaded);
    
    // Auto-route based on state
    if (loaded.id) {
      checkDailyStatus(loaded);
    }
  }, []);

  const checkDailyStatus = (state: UserState) => {
    const today = getTodayString();
    const todaySession = state.sessions[today];

    if (todaySession && todaySession.surveyCompleted) {
      setCurrentScreen(AppScreen.COMPLETED);
    } else {
      // Whether it's a new day or a continued session, go to chat
      setCurrentScreen(AppScreen.CHAT);
    }
  };

  const handleLogin = (id: string) => {
    const newState = { ...userState, id };
    setUserState(newState);
    saveUserState(newState);
    checkDailyStatus(newState);
  };

  const handleSendMessage = (text: string, sender: Sender) => {
    const newState = addMessageToSession(userState, text, sender);
    setUserState(newState);
  };

  const handleStartSurvey = () => {
    setCurrentScreen(AppScreen.SURVEY);
  };

  const handleSurveySubmit = (data: SurveyResponse) => {
    const newState = markSurveyCompleted(userState, data);
    setUserState(newState);
    setCurrentScreen(AppScreen.COMPLETED);
  };

  // Render Router
  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.LOGIN:
        return <LoginScreen onLogin={handleLogin} />;
      
      case AppScreen.CHAT:
        const todaySession = getOrCreateTodaySession(userState);
        return (
          <ChatScreen 
            session={todaySession} 
            onSendMessage={handleSendMessage}
            onStartSurvey={handleStartSurvey}
          />
        );
      
      case AppScreen.SURVEY:
        return <SurveyScreen onSubmit={handleSurveySubmit} />;
      
      case AppScreen.COMPLETED:
        return <CompletionScreen />;
        
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="h-full w-full">
      {renderScreen()}
    </div>
  );
};

export default App;