import { UserState, DailySession, Message, Sender, SurveyResponse } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Helper to get today's date string YYYY-MM-DD
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const generateStudyID = (): string => {
  const prefix = 'MH';
  const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit random
  return `${prefix}${randomNum}`;
};

// --- Async Database Operations ---

// 1. Login or Register User & Fetch Today's Session
export const loginAndFetchData = async (studyId: string): Promise<UserState> => {
  const today = getTodayString();
  const initialState: UserState = { id: studyId, sessions: {} };

  if (!isSupabaseConfigured()) {
    console.warn("Supabase credentials missing. Using InMemory/LocalStorage mock.");
    // Fallback to local storage logic for demo purposes if keys aren't set
    const stored = localStorage.getItem('research_app_data_v1');
    if (stored) return JSON.parse(stored);
    return initialState;
  }

  try {
    // A. Check/Create Participant
    const { error: userError } = await supabase
      .from('participants')
      .upsert({ study_id: studyId }, { onConflict: 'study_id', ignoreDuplicates: true })
      .select();

    if (userError) throw userError;

    // B. Check for existing session today (Session Only first)
    let { data: sessionData, error: sessionError } = await supabase
      .from('daily_sessions')
      .select('*')
      .eq('study_id', studyId)
      .eq('date', today)
      .single();

    if (sessionError && sessionError.code !== 'PGRST116') { // PGRST116 is "Row not found"
       console.error("Error fetching session", sessionError);
    }

    // C. If no session exists, create one
    if (!sessionData) {
      const { data: newSession, error: createError } = await supabase
        .from('daily_sessions')
        .insert({
          study_id: studyId,
          date: today,
          survey_completed: false,
          has_chatted: false
        })
        .select()
        .single();
      
      if (createError) throw createError;
      sessionData = newSession;
    }

    // D. Fetch Messages Separately (More robust than Join)
    // We explicitly fetch messages for this session ID ensuring we get the history
    let sortedMessages: Message[] = [];
    if (sessionData && sessionData.id) {
        const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('id, content, sender, created_at')
            .eq('session_id', sessionData.id)
            .order('created_at', { ascending: true });
        
        if (messagesError) {
            console.error("Error fetching messages:", messagesError);
        } else if (messagesData) {
             sortedMessages = messagesData.map((m: any) => ({
                id: m.id,
                text: m.content,
                sender: m.sender as Sender,
                timestamp: new Date(m.created_at).getTime()
            }));
        }
    }

    // E. Map DB structure to App structure
    const mappedSession: DailySession = {
      id: sessionData.id,
      date: sessionData.date,
      surveyCompleted: sessionData.survey_completed,
      hasChatted: sessionData.has_chatted,
      surveyData: sessionData.survey_data,
      messages: sortedMessages
    };

    return {
      id: studyId,
      sessions: {
        [today]: mappedSession
      }
    };

  } catch (err) {
    console.error("Database Error during Login:", err);
    return initialState;
  }
};

// 2. Add Message
export const saveMessageToDb = async (
  studyId: string, 
  sessionId: string, 
  text: string, 
  sender: Sender,
  currentState: UserState
): Promise<UserState> => {
  const today = getTodayString();
  
  // Optimistic Update (update UI immediately)
  const tempId = crypto.randomUUID();
  const newMessage: Message = {
    id: tempId,
    text,
    sender,
    timestamp: Date.now()
  };

  // Get current session or create default structure if it doesn't exist yet
  const currentSession = currentState.sessions[today] || {
    id: sessionId,
    date: today,
    messages: [],
    surveyCompleted: false,
    hasChatted: false
  };

  const updatedSession = {
    ...currentSession,
    messages: [...currentSession.messages, newMessage],
    hasChatted: true
  };

  const newState = {
    ...currentState,
    sessions: { ...currentState.sessions, [today]: updatedSession }
  };

  if (isSupabaseConfigured()) {
    // Background DB Sync
    (async () => {
      try {
        let validSessionId = sessionId;

        // SELF-HEALING: If sessionId is invalid (e.g. 'temp-offline-id'), fetch or create the real one
        if (!validSessionId || validSessionId.length < 10) {
            console.warn("Invalid Session ID detected during save. Attempting recovery...");
            const { data: recoveredSession } = await supabase
                .from('daily_sessions')
                .select('id')
                .eq('study_id', studyId)
                .eq('date', today)
                .single();
            
            if (recoveredSession) {
                validSessionId = recoveredSession.id;
            } else {
                // Create if absolutely missing
                 const { data: newSession } = await supabase
                .from('daily_sessions')
                .insert({ study_id: studyId, date: today })
                .select('id')
                .single();
                if (newSession) validSessionId = newSession.id;
            }
        }

        // Now perform the insert with the guaranteed valid ID
        await Promise.all([
          supabase.from('messages').insert({
            session_id: validSessionId,
            sender: sender,
            content: text
          }),
          // Mark session as chatted
          supabase.from('daily_sessions').update({ has_chatted: true }).eq('id', validSessionId)
        ]);

      } catch (err) {
        console.error("DB Save Error:", err);
      }
    })();
  } else {
    // Fallback Local Storage
    localStorage.setItem('research_app_data_v1', JSON.stringify(newState));
  }

  return newState;
};

// 3. Mark Survey Complete
export const saveSurveyToDb = async (
  studyId: string,
  sessionId: string,
  data: SurveyResponse,
  currentState: UserState
): Promise<UserState> => {
  const today = getTodayString();

  // Get current session or create default structure if it doesn't exist yet
  const currentSession = currentState.sessions[today] || {
    id: sessionId,
    date: today,
    messages: [],
    surveyCompleted: false
  };

  const updatedSession = {
    ...currentSession,
    surveyCompleted: true,
    surveyData: data
  };

  const newState = {
    ...currentState,
    sessions: { ...currentState.sessions, [today]: updatedSession }
  };

  if (isSupabaseConfigured()) {
    await supabase.from('daily_sessions')
      .update({
        survey_completed: true,
        survey_data: data
      })
      .eq('id', sessionId);
  } else {
    localStorage.setItem('research_app_data_v1', JSON.stringify(newState));
  }

  return newState;
};


// Helper for App.tsx to avoid complex logic there
export const getTodaySessionOrEmpty = (state: UserState): DailySession => {
  const today = getTodayString();
  if (state.sessions && state.sessions[today]) {
    return state.sessions[today];
  }
  return {
    date: today,
    messages: [],
    surveyCompleted: false,
    hasChatted: false
  };
};