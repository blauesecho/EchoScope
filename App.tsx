
import React, { useState, useEffect, useCallback } from 'react';
import { analyzePoliticalProject, deepenPoliticalAnalysis } from './services/geminiService';
import { PoliticalReport, SavedReport, ExtendedReport } from './types';
import ReportView from './components/ReportView';
import BlauesEchoLogo from './components/BlauesEchoLogo';
import { Search, Loader2, ShieldAlert, BarChart3, MessageSquare, History, Trash2, Clock, ChevronRight, Zap, Info, XCircle } from 'lucide-react';

const STORAGE_KEY = 'echoscope_history_v4';

const App: React.FC = () => {
  const [project, setProject] = useState('');
  const [loading, setLoading] = useState(false);
  const [deepening, setDeepening] = useState(false);
  const [report, setReport] = useState<PoliticalReport | null>(null);
  const [extendedReport, setExtendedReport] = useState<ExtendedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);
    setExtendedReport(null);

    try {
      const result = await analyzePoliticalProject(project);
      setReport(result);
      
      const newSaved: SavedReport = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        projectDescription: project,
        report: result
      };
      setHistory(prev => [newSaved, ...prev.slice(0, 19)]);
    } catch (err: any) {
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeepenAnalysis = async () => {
    if (!report || !project) return;
    setDeepening(true);
    try {
      const result = await deepenPoliticalAnalysis(project, report);
      setExtendedReport(result);
      
      setHistory(prev => prev.map(item => 
        item.projectDescription === project && item.report === report
          ? { ...item, extendedReport: result }
          : item
      ));
    } catch (err: any) {
      setError("Vertiefte Analyse fehlgeschlagen: " + err.message);
    } finally {
      setDeepening(false);
    }
  };

  const loadFromHistory = (item: SavedReport) => {
    setReport(item.report);
    setExtendedReport(item.extendedReport || null);
    setProject(item.projectDescription);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-12 flex flex-col">
      {/* 1. Header Logo */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BlauesEchoLogo className="h-8" />
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <div>
              <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">EchoScope</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Analyse-Modul</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${showHistory ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Verlauf ({history.length})</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 flex-grow">
        
        {/* 2. Hero Section Logo */}
        {!report && !loading && (
          <div className="mb-16 text-center animate-in fade-in duration-1000">
            <div className="flex justify-center mb-8">
               <BlauesEchoLogo className="h-20" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-[#0f172a] mb-4 tracking-tighter italic">EchoScope</h2>
            <p className="text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto">
              Politische Wirkungs- und Resonanzanalyse
            </p>
            
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 max-w-3xl mx-auto text-left space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                 <BlauesEchoLogo variant="icon" className="h-40" />
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                EchoScope ist ein analytisches Werkzeug zur strukturierten Bewertung politischer Projekte. 
                Wir zeigen auf Basis von Kommunikationslogik, wie Vorhaben wirken – jenseits von Meinungen oder moralischen Wertungen.
              </p>
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start space-x-4">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-indigo-100 flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Wirkung statt Meinung</p>
                  <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                    Nüchterne Analyse von Sprache, Framing und Resonanzfeldern gesellschaftlicher Gruppen. Journalistisch unabhängig.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="mb-12 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden transition-all focus-within:border-indigo-300 focus-within:shadow-indigo-50 shadow-slate-100">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-[#0f172a] rounded-lg">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Vorhabens-Eingabe</h2>
            </div>
          </div>
          <form onSubmit={handleAnalyze} className="p-8">
            <textarea
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Beschreiben Sie hier das politische Vorhaben, die Gesetzesinitiative oder das Projekt ..."
              className="w-full h-32 p-0 text-xl text-slate-800 placeholder:text-slate-300 bg-transparent border-none focus:ring-0 resize-none font-medium leading-snug"
            />
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading || !project.trim()}
                className="inline-flex items-center px-10 py-4 bg-[#0f172a] hover:bg-[#1e293b] text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Analysiere...
                  </>
                ) : (
                  <>
                    <BarChart3 className="-ml-1 mr-3 h-5 w-5" />
                    Wirkung analysieren
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* History Modal Overlay */}
        {showHistory && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <History className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Analyse-Verlauf</h2>
                </div>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-20 text-slate-300">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-medium">Noch keine Analysen gespeichert.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="group p-5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl cursor-pointer transition-all relative"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        {new Date(item.timestamp).toLocaleDateString('de-DE')}
                      </span>
                      <p className="text-sm text-slate-700 font-bold line-clamp-2 leading-tight">
                        {item.projectDescription}
                      </p>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center space-x-4 text-rose-800 animate-in fade-in zoom-in-95">
            <ShieldAlert className="w-6 h-6 flex-shrink-0 text-rose-500" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {report && (
          <ReportView 
            report={report} 
            extendedReport={extendedReport}
            projectDescription={project} 
            onDeepen={handleDeepenAnalysis}
            deepening={deepening}
          />
        )}
      </main>

      {/* 3. Footer Logo */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 py-16 border-t border-slate-200 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start">
             <BlauesEchoLogo className="h-10 mb-2 opacity-80" />
          </div>
          
          <div className="flex items-center space-x-6 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
            <span className="hover:text-slate-500 cursor-default transition-colors">Herausgeber: Blaues Echo</span>
            <span className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
            <span className="hover:text-slate-500 cursor-default transition-colors">&copy; 2024 EchoScope Analytik</span>
          </div>

          <div className="flex items-center space-x-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-right leading-none">Powered by<br/>Blaues Echo</p>
             <BlauesEchoLogo variant="icon" className="h-12" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
