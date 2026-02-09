import { UserState, DailySession, Message, Sender } from '../types';

const STORAGE_KEY = 'research_app_data_v1';

// Helper to get today's date string YYYY-MM-DD
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const loadUserState = (): UserState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    id: null,
    sessions: {},
  };
};

export const saveUserState = (state: UserState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const generateStudyID = (): string => {
  const prefix = 'MH';
  const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit random
  return `${prefix}${randomNum}`;
};

export const getOrCreateTodaySession = (state: UserState): DailySession => {
  const today = getTodayString();
  if (!state.sessions[today]) {
    // Start new session
    state.sessions[today] = {
      date: today,
      messages: [],
      surveyCompleted: false,
    };
    saveUserState(state);
  }
  return state.sessions[today];
};

export const addMessageToSession = (state: UserState, text: string, sender: Sender): UserState => {
  const today = getTodayString();
  const session = state.sessions[today];
  
  if (!session) return state;

  const newMessage: Message = {
    id: crypto.randomUUID(),
    text,
    sender,
    timestamp: Date.now(),
  };

  const updatedSession = {
    ...session,
    messages: [...session.messages, newMessage],
  };

  const newState = {
    ...state,
    sessions: {
      ...state.sessions,
      [today]: updatedSession,
    },
  };

  saveUserState(newState);
  return newState;
};

export const markSurveyCompleted = (state: UserState, surveyData: any): UserState => {
  const today = getTodayString();
  const session = state.sessions[today];
  
  if (!session) return state;

  const updatedSession = {
    ...session,
    surveyCompleted: true,
    surveyData: surveyData
  };

  const newState = {
    ...state,
    sessions: {
      ...state.sessions,
      [today]: updatedSession,
    },
  };

  saveUserState(newState);
  return newState;
};