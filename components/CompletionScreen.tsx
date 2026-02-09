import React from 'react';
import { CalendarCheck, ShieldCheck, LogOut } from 'lucide-react';

interface CompletionScreenProps {
    onLogout: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-accent/5 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-white/50">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-6 rounded-full animate-pulse">
              <CalendarCheck className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-primary mb-4">
            Danke für heute!
          </h1>
          
          <p className="text-secondary mb-8 leading-relaxed">
            Du hast die heutige Session und die Umfrage erfolgreich abgeschlossen. 
            Wir freuen uns darauf, morgen wieder mit dir zu sprechen.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Deine Daten wurden sicher gespeichert.</span>
          </div>

          <button 
            onClick={onLogout}
            className="text-slate-400 hover:text-primary text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <LogOut size={16} />
            Zur Startseite zurückkehren
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen;