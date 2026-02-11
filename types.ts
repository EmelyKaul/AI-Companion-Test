
export enum Sender {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string; // UUID from DB
  text: string;
  sender: Sender;
  timestamp: number;
}

export interface SurveyResponse {
  date: string;
  q1_mood?: number; // Optional now, as we use external Qualtrics
  q2_helpfulness?: number; 
  q3_comments?: string;
  externalCompleted?: boolean; // New flag
}

export interface DailySession {
  id?: string; // UUID from DB
  date: string; // YYYY-MM-DD
  messages: Message[];
  surveyCompleted: boolean;
  hasChatted?: boolean; // New field to track if chat interaction occurred
  surveyData?: SurveyResponse;
}

export interface UserState {
  id: string | null;
  sessions: Record<string, DailySession>; // Keyed by date YYYY-MM-DD
}

export enum AppScreen {
  LOGIN = 'LOGIN',
  CHAT = 'CHAT',
  SURVEY = 'SURVEY',
  COMPLETED = 'COMPLETED',
}
