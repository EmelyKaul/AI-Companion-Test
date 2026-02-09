import React, { useState } from 'react';
import { SurveyResponse } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface SurveyScreenProps {
  onSubmit: (data: SurveyResponse) => void;
}

const SurveyScreen: React.FC<SurveyScreenProps> = ({ onSubmit }) => {
  const [mood, setMood] = useState<number | null>(null);
  const [helpfulness, setHelpfulness] = useState<number | null>(null);
  const [comments, setComments] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood !== null && helpfulness !== null) {
      onSubmit({
        date: new Date().toISOString(),
        q1_mood: mood,
        q2_helpfulness: helpfulness,
        q3_comments: comments
      });
    }
  };

  const LikertScale = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string, 
    value: number | null, 
    onChange: (v: number) => void 
  }) => (
    <div className="mb-8">
      <label className="block text-sm font-semibold text-slate-700 mb-4">{label}</label>
      <div className="flex justify-between px-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
              value === num
                ? 'bg-accent text-white shadow-lg scale-110'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-2 px-1 text-xs text-slate-400 font-medium">
        <span>Gar nicht</span>
        <span>Sehr</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary p-6 text-white text-center">
          <h2 className="text-xl font-bold">Tagesabschluss</h2>
          <p className="text-slate-300 text-sm mt-1">Bitte beantworte 3 kurze Fragen</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <LikertScale 
            label="Wie geht es dir nach dem Gespräch?" 
            value={mood} 
            onChange={setMood} 
          />
          
          <LikertScale 
            label="Wie hilfreich war der Companion heute?" 
            value={helpfulness} 
            onChange={setHelpfulness} 
          />

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Hast du weitere Anmerkungen? (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none h-24 resize-none"
              placeholder="Deine Gedanken..."
            />
          </div>

          <button
            type="submit"
            disabled={mood === null || helpfulness === null}
            className="w-full bg-accent hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Absenden
          </button>
        </form>
      </div>
    </div>
  );
};

export default SurveyScreen;