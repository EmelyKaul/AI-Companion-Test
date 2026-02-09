import React from 'react';
import { CalendarCheck, ShieldCheck } from 'lucide-react';

const CompletionScreen: React.FC = () => {
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

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            <span>Deine Daten wurden sicher gespeichert.</span>
          </div>
        </div>
        
        <p className="mt-8 text-sm text-slate-400">
          Du kannst die App jetzt schließen.
        </p>
      </div>
    </div>
  );
};

export default CompletionScreen;