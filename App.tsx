import React, { useState, useEffect, useRef } from 'react';
import { UserState, AppScreen, Sender, SurveyResponse } from './types';
import { 
  loginAndFetchData,
  saveMessageToDb,
  saveSurveyToDb,
  getTodaySessionOrEmpty, 
  getTodayString
} from './services/storage';

// Screens
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';
import SurveyScreen from './components/SurveyScreen';
import CompletionScreen from './components/CompletionScreen';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Explicitly initialize with null/empty state to force Login on refresh
  const [userState, setUserState] = useState<UserState>({ id: null, sessions: {} });
  
  // REF PATTERN: We use a Ref to track the latest state.
  // This prevents "Stale Closures" where async functions (like the 2-second AI wait)
  // overwrite the state with an old version because they captured the variable too early.
  const userStateRef = useRef<UserState>(userState);

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [loading, setLoading] = useState(false);

  // Keep Ref in sync with State
  useEffect(() => {
    userStateRef.current = userState;
  }, [userState]);

  // Security Guard: Check on mount and update if user is missing but screen is protected
  useEffect(() => {
    if (currentScreen !== AppScreen.LOGIN && !userState.id) {
      console.warn("No User ID found, redirecting to Login");
      setCurrentScreen(AppScreen.LOGIN);
    }
  }, [currentScreen, userState.id]);

  const checkDailyStatus = (state: UserState) => {
    const today = getTodayString();
    const todaySession = state.sessions[today];

    if (todaySession && todaySession.surveyCompleted) {
      setCurrentScreen(AppScreen.COMPLETED);
    } else {
      setCurrentScreen(AppScreen.CHAT);
    }
  };

  const handleLogin = async (id: string) => {
    setLoading(true);
    try {
      const newState = await loginAndFetchData(id);
      setUserState(newState);
      checkDailyStatus(newState);
    } catch (e) {
      console.error("Login failed", e);
      // Even on error, ensure we don't end up in an undefined state
      setUserState({ id: null, sessions: {} });
      setCurrentScreen(AppScreen.LOGIN);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // Resetting state completely
    setUserState({ id: null, sessions: {} });
    setCurrentScreen(AppScreen.LOGIN);
    
    // Optional: Clear console to make debugging easier
    console.clear();
  };

  const handleSendMessage = async (text: string, sender: Sender) => {
    // CRITICAL FIX: Use userStateRef.current instead of userState
    // This ensures we always add messages to the LATEST state, 
    // even if this function is called after an async delay (AI response).
    const currentLatestState = userStateRef.current;
    
    const session = getTodaySessionOrEmpty(currentLatestState);
    if (!session.id && sender === Sender.USER) {
        console.warn("No session ID found during chat");
    }
    
    const newState = await saveMessageToDb(
      currentLatestState.id!, 
      session.id || 'temp-offline-id', 
      text, 
      sender, 
      currentLatestState
    );
    setUserState(newState);
  };

  const handleStartSurvey = () => {
    setCurrentScreen(AppScreen.SURVEY);
  };

  const handleSurveySubmit = async (data: SurveyResponse) => {
    // Use Ref here too for consistency/safety
    const currentLatestState = userStateRef.current;
    const session = getTodaySessionOrEmpty(currentLatestState);
    
    setLoading(true);
    try {
        const newState = await saveSurveyToDb(
            currentLatestState.id!,
            session.id || 'temp-offline-id',
            data,
            currentLatestState
        );
        setUserState(newState);
        setCurrentScreen(AppScreen.COMPLETED);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-accent" />
        <p>Laden...</p>
      </div>
    );
  }

  // Render Router
  const renderScreen = () => {
    // Immediate check during render to prevent flickering of wrong screen
    if (!userState.id && currentScreen !== AppScreen.LOGIN) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    switch (currentScreen) {
      case AppScreen.LOGIN:
        return <LoginScreen onLogin={handleLogin} />;
      
      case AppScreen.CHAT:
        const todaySession = getTodaySessionOrEmpty(userState);
        return (
          <ChatScreen 
            session={todaySession} 
            onSendMessage={handleSendMessage}
            onStartSurvey={handleStartSurvey}
            onLogout={handleLogout}
          />
        );
      
      case AppScreen.SURVEY:
        return <SurveyScreen onSubmit={handleSurveySubmit} />;
      
      case AppScreen.COMPLETED:
        return <CompletionScreen onLogout={handleLogout} />;
        
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="h-full w-full">
      {renderScreen()}
    </div>
  );
};

export default App;