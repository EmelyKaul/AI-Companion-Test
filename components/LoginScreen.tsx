import React, { useState } from 'react';
import { generateStudyID } from '../services/storage';
import { User as UserIcon, ArrowRight, Clipboard } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (id: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [inputId, setInputId] = useState('');
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'entry' | 'generated'>('entry');
  const [error, setError] = useState('');

  const handleGenerate = () => {
    const newId = generateStudyID();
    setGeneratedId(newId);
    setMode('generated');
  };

  const handleStart = () => {
    const idToUse = mode === 'generated' ? generatedId : inputId;
    
    if (!idToUse || idToUse.trim().length < 5) {
      setError('Bitte eine gültige ID eingeben.');
      return;
    }
    
    onLogin(idToUse.trim());
  };

  const copyToClipboard = () => {
    if (generatedId) {
      navigator.clipboard.writeText(generatedId);
      // Optional: Show toast
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-accent/10 p-4 rounded-full">
            <UserIcon className="w-8 h-8 text-accent" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-primary mb-2">Willkommen!</h1>
        <p className="text-center text-secondary mb-8 text-sm">
          Bitte gib deine Studien-ID ein oder generiere eine neue, falls du zum ersten Mal hier bist.
        </p>

        {mode === 'entry' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Studien-ID</label>
              <input
                type="text"
                value={inputId}
                onChange={(e) => {
                  setInputId(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="z.B. MH123456"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-lg font-mono placeholder:font-sans"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-primary hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Starten <ArrowRight className="w-4 h-4" />
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-400">oder</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full bg-white border-2 border-slate-200 text-slate-600 font-semibold py-3 px-4 rounded-lg hover:border-accent hover:text-accent transition-colors"
            >
              Neue ID generieren
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 text-sm font-medium mb-2">WICHTIG: Bitte speichern!</p>
              <div className="flex items-center justify-center gap-2 bg-white p-3 rounded border border-yellow-100 mb-2">
                <span className="text-2xl font-mono font-bold text-primary tracking-wider">{generatedId}</span>
                <button onClick={copyToClipboard} className="text-slate-400 hover:text-accent p-1">
                  <Clipboard className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-yellow-700">Du benötigst diese ID für den täglichen Login.</p>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-accent hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-sky-500/30"
            >
              Ich habe die ID gespeichert
            </button>
            
             <button
              onClick={() => setMode('entry')}
              className="w-full text-slate-400 text-sm hover:text-slate-600 py-2"
            >
              Zurück
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;