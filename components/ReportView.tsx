
import React, { useRef, useState } from 'react';
import { PoliticalReport, TargetGroupAnalysis, ExtendedReport, Scenario } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import BlauesEchoLogo from './BlauesEchoLogo';
import { 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  MessageCircle, 
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  Share2,
  Twitter, 
  Linkedin,
  Mail,
  Copy,
  Check,
  Layers,
  Sparkles,
  ArrowRightCircle,
  Clock,
  ShieldCheck,
  Activity,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ReportViewProps {
  report: PoliticalReport;
  extendedReport?: ExtendedReport | null;
  projectDescription?: string;
  onDeepen?: () => void;
  deepening?: boolean;
}

const TargetGroupCard: React.FC<{ data: TargetGroupAnalysis }> = ({ data }) => {
  const prob = data.erfolgswahrscheinlichkeit;
  const colorClass = prob >= 70 ? 'text-emerald-500' : prob >= 40 ? 'text-amber-500' : 'text-rose-500';
  const bgClass = prob >= 70 ? 'bg-emerald-50' : prob >= 40 ? 'bg-amber-50' : 'bg-rose-50';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:border-indigo-100 transition-all">
      <div className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${bgClass}/30`}>
        <h4 className="font-bold text-slate-800 text-sm">{data.name}</h4>
        <div className="text-right">
          <span className={`text-xl font-black ${colorClass}`}>{prob}%</span>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Resonanz</p>
        </div>
      </div>
      <div className="p-6 flex-grow space-y-6">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Kernbotschaft</span>
          <p className="text-sm font-bold text-slate-800 leading-snug">{data.kernbotschaft}</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Zap className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Emotionaler Hebel</span>
              <p className="text-xs text-slate-600 font-medium italic">"{data.emotionalerHebel}"</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Activity className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Logik</span>
              <p className="text-xs text-slate-500 leading-relaxed">{data.argumentationslogik}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50">
          <p className="text-[11px] text-slate-500 leading-snug italic">{data.begruendung}</p>
        </div>
      </div>
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <MessageCircle className="w-3 h-3" />
        <span>Stil: {data.sprachstil}</span>
      </div>
    </div>
  );
};

const ScenarioCard: React.FC<{ data: Scenario; type: 'best' | 'real' | 'worst' }> = ({ data, type }) => {
  const styles = {
    best: 'border-emerald-200 bg-emerald-50/20',
    real: 'border-slate-200 bg-slate-50/50',
    worst: 'border-rose-200 bg-rose-50/20'
  };
  const badge = {
    best: 'bg-emerald-100 text-emerald-700',
    real: 'bg-slate-200 text-slate-700',
    worst: 'bg-rose-100 text-rose-700'
  };

  return (
    <div className={`p-6 rounded-3xl border ${styles[type]} flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-800">{data.titel}</h4>
        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${badge[type]}`}>
          {type.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-6 flex-grow">{data.beschreibung}</p>
      <div className="pt-4 border-t border-slate-200/50 flex justify-between gap-4">
        <div>
          <span className="text-[8px] font-bold uppercase text-slate-400 block mb-1">Eintritt</span>
          <span className="text-xs font-bold text-slate-700">{data.eintrittswahrscheinlichkeit}</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-bold uppercase text-slate-400 block mb-1">Auswirkung</span>
          <span className="text-xs font-bold text-slate-700">{data.auswirkung}</span>
        </div>
      </div>
    </div>
  );
};

const ReportView: React.FC<ReportViewProps> = ({ report, extendedReport, projectDescription, onDeepen, deepening }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const chartData = report.zielgruppen.map(zg => ({
    name: zg.name,
    prob: zg.erfolgswahrscheinlichkeit
  }));

  const exportToPdf = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
        onclone: (clonedDoc) => {
          const buttons = clonedDoc.querySelectorAll('.no-export');
          buttons.forEach(b => (b as HTMLElement).style.display = 'none');
          // Ensure logo components are rendered as SVG in PDF
          const pdfLogos = clonedDoc.querySelectorAll('.pdf-logo');
          pdfLogos.forEach(l => (l as HTMLElement).style.display = 'block');
        }
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`EchoScope_Analyse_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const getSummaryText = () => {
    const lines = [
      `EchoScope Wirkungsanalyse: ${projectDescription || 'Vorhaben'}`,
      `================================================`,
      `GESAMTEINSCHÄTZUNG:`,
      report.gesamtbewertung,
      '',
      `RESONANZ-SCORES:`,
      ...report.zielgruppen.map(zg => `- ${zg.name}: ${zg.erfolgswahrscheinlichkeit}%`),
      '',
      `STRATEGISCHES FRAMING:`,
      report.kommunikationsempfehlung.framing,
      '',
      `Analysiert mit EchoScope (Blaues Echo)`
    ];
    return lines.join('\n');
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Actions */}
      <div className="flex justify-end items-center space-x-3 no-print no-export">
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4 mr-2 text-indigo-600" />
            Teilen
          </button>
          
          {showShareMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                <button 
                  onClick={async () => {
                    await navigator.clipboard.writeText(getSummaryText());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }} 
                  className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <Copy className="w-4 h-4 mr-3 text-slate-400" />
                    Zusammenfassung kopieren
                  </span>
                  {copied && <Check className="w-3 h-3 text-emerald-500" />}
                </button>
                <div className="h-px bg-slate-100" />
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getSummaryText().slice(0, 200))}`, '_blank')} className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                  <Twitter className="w-4 h-4 mr-3 text-sky-500" />
                  Auf X teilen
                </button>
                <button onClick={() => window.location.href = `mailto:?subject=EchoScope Analyse&body=${encodeURIComponent(getSummaryText())}`} className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-rose-500" />
                  Per E-Mail senden
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={exportToPdf}
          disabled={exporting}
          className="inline-flex items-center px-5 py-2.5 bg-[#0f172a] text-white rounded-2xl shadow-lg shadow-slate-200 text-sm font-bold hover:bg-[#1e293b] transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
          PDF Export
        </button>
      </div>

      <div ref={reportRef} className="space-y-16">
        
        {/* 4. PDF Branding Header */}
        <div className="hidden pdf-logo print:block mb-10 border-b-4 border-[#0f172a] pb-8">
          <div className="flex justify-between items-start">
            <div>
              <BlauesEchoLogo className="h-16 mb-4" />
              <h1 className="text-4xl font-black text-[#0f172a] tracking-tighter italic">EchoScope Analyse</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Statusbericht Wirkungsanalyse • Blaues Echo</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analysedatum</p>
              <p className="text-slate-900 font-black text-lg">{new Date().toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        </div>

        {/* Section: Project Overview & Global Score */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.05] transition-opacity">
                 <BlauesEchoLogo variant="icon" className="h-40" />
              </div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-[#0f172a] rounded-full" />
                <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Projektüberblick</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">{report.projektueberblick}</p>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Zentrale Konfliktlinien</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.konfliktlinien.map((line, idx) => (
                  <div key={idx} className="flex items-start p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-[10px] font-black mr-4 mt-0.5 shadow-md shadow-slate-200">{idx + 1}</span>
                    <p className="text-sm text-slate-700 font-bold leading-tight">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#0f172a] text-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 h-full flex flex-col relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 opacity-10">
                {/* Fixed: Removed duplicate variant="icon" as variant="white" is also present */}
                 <BlauesEchoLogo className="h-40" variant="white" />
              </div>
              <div className="flex items-center space-x-3 mb-8 relative z-10">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold tracking-tight">Gesamteinschätzung</h2>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-10 flex-grow relative z-10 font-medium">{report.gesamtbewertung}</p>
              
              <div className="pt-8 border-t border-white/10 relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-6">Resonanz-Dashboard</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 20 }}>
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" width={100} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} />
                      <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => active && payload ? <div className="bg-white text-slate-800 p-2 rounded shadow text-[10px] font-bold">{payload[0].value}%</div> : null} />
                      <Bar dataKey="prob" radius={[0, 4, 4, 0]} barSize={8}>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.prob > 60 ? '#10b981' : entry.prob > 40 ? '#f59e0b' : '#ef4444'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Resonance per group */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm"><Users className="w-6 h-6 text-slate-600" /></div>
              <h2 className="text-2xl font-black text-[#0f172a] tracking-tighter uppercase italic">Gesellschaftliche Resonanz</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {report.zielgruppen.map((zg, idx) => <div key={idx}><TargetGroupCard data={zg} /></div>)}
          </div>
        </section>

        {/* Risks & Framing */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-rose-50 p-2.5 rounded-xl"><AlertTriangle className="w-5 h-5 text-rose-600" /></div>
              <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Kommunikative Risiken</h2>
            </div>
            <ul className="space-y-4">
              {report.hauptrisiken.map((risk, idx) => (
                <li key={idx} className="flex items-start text-sm text-slate-600 font-bold">
                  <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 mr-4 flex-shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-indigo-50 p-2.5 rounded-xl"><MessageCircle className="w-5 h-5 text-indigo-600" /></div>
              <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Strategische Rahmung</h2>
            </div>
            <div className="space-y-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 border-l-4 border-l-indigo-500">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-3">Narratives Framing</span>
                <p className="text-base text-slate-800 font-black leading-relaxed">"{report.kommunikationsempfehlung.framing}"</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-4">Positive Begriffe</span>
                  <div className="flex flex-wrap gap-2">
                    {report.kommunikationsempfehlung.begriffe.map((term, i) => <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100 uppercase tracking-tighter">{term}</span>)}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-4">No-Gos</span>
                  <div className="flex flex-wrap gap-2">
                    {report.kommunikationsempfehlung.noGos.map((term, i) => <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-100 uppercase tracking-tighter">{term}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Deep Analysis Module */}
        <section className="pt-8 border-t border-slate-200">
          {!extendedReport && !deepening && (
            <div className="no-export bg-indigo-50/40 border-2 border-dashed border-indigo-200 rounded-[3rem] p-16 text-center group transition-all hover:bg-indigo-50 hover:border-indigo-300">
              <div className="inline-flex items-center justify-center mb-8 transition-transform group-hover:scale-110">
                 <BlauesEchoLogo className="h-20" />
              </div>
              <div className="max-w-2xl mx-auto mb-10">
                <h2 className="text-3xl font-black text-[#0f172a] mb-4 tracking-tighter italic">Erweiterte Analyseebene</h2>
                <p className="text-slate-500 leading-relaxed text-base font-medium">
                  Diese Auswertung stellt eine erste strategische Einordnung dar. 
                  Aktivieren Sie die vertiefte Wirkungsabschätzung von Blaues Echo, um Milieus, Szenarien und Kipppunkte im Detail zu modellieren.
                </p>
              </div>
              <div className="flex flex-col items-center gap-5">
                <button
                  onClick={onDeepen}
                  className="inline-flex items-center px-12 py-5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-2xl shadow-2xl shadow-indigo-100 font-black transition-all hover:scale-[1.05] active:scale-[0.95] group uppercase tracking-[0.2em] text-xs"
                >
                  <Sparkles className="w-5 h-5 mr-4 text-indigo-400 group-hover:animate-pulse" />
                  Analyse vertiefen
                </button>
                <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-black uppercase tracking-[0.25em]">
                   <span>Blaues Echo</span>
                   <span className="w-1 h-1 bg-slate-300 rounded-full" />
                   <span>Zusatzmodul</span>
                </div>
              </div>
            </div>
          )}

          {deepening && (
            <div className="no-export bg-white border border-slate-200 rounded-[3rem] p-24 text-center shadow-xl shadow-slate-100">
              <div className="relative inline-block mb-10">
                 <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                    <BlauesEchoLogo variant="icon" className="h-10" />
                 </div>
              </div>
              <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">Deep Analysis wird modelliert...</h3>
              <p className="text-slate-400 text-base mt-4 font-medium">Szenarienvergleich und Milieu-Segmentierung werden generiert.</p>
            </div>
          )}

          {extendedReport && (
            <div className="space-y-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="flex items-center justify-between border-b-4 border-indigo-600 pb-8">
                <div className="flex items-center space-x-5">
                  <div className="bg-[#0f172a] p-4 rounded-2xl text-white shadow-xl shadow-indigo-100">
                    {/* Fixed: Removed duplicate variant="icon" as variant="white" is also present */}
                     <BlauesEchoLogo className="h-8" variant="white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter italic leading-none italic">EchoScope Deep Analysis</h2>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Herausgeber: Blaues Echo</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-3 text-indigo-600 font-black text-[10px] uppercase bg-white border-2 border-indigo-100 px-5 py-2.5 rounded-2xl shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Deep-Analysis Verifiziert</span>
                </div>
              </div>

              {/* Milieu Detailing */}
              <section>
                <div className="flex items-center space-x-3 mb-10">
                   <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse" />
                   <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight italic">Feinere Milieu-Segmentierung</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {extendedReport.milieuSegmentierung.map((m, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-md hover:shadow-lg transition-all relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest">{m.name}</span>
                        <span className="text-xs font-black text-indigo-600 group-hover:scale-110 transition-transform">{m.affinitaet}%</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{m.beschreibung}</p>
                      <div className="mt-8 w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#0f172a] h-full transition-all duration-1000" style={{ width: `${m.affinitaet}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Narratives */}
              <section className="bg-[#0f172a] p-16 rounded-[4rem] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.05]">
                   {/* Fixed: Removed duplicate variant="icon" as variant="white" is also present */}
                   <BlauesEchoLogo className="h-64" variant="white" />
                </div>
                <h3 className="text-2xl font-black mb-12 text-indigo-400 uppercase tracking-tighter italic">Alternative Kommunikationsnarrative</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative z-10">
                  {extendedReport.alternativeNarrative.map((n, i) => (
                    <div key={i} className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <ArrowRightCircle className="w-6 h-6 text-indigo-400" />
                        <h4 className="font-black text-lg uppercase tracking-tight">{n.titel}</h4>
                      </div>
                      <p className="text-base text-slate-300 font-bold italic">"{n.ansatz}"</p>
                      <div className="pt-6 border-t border-white/5">
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.3em] block mb-2">Resonanz-Vorteil</span>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">{n.vorteil}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Scenarios */}
              <section>
                <div className="flex items-center space-x-3 mb-10">
                   <div className="w-3 h-3 bg-[#0f172a] rounded-full" />
                   <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight italic">Szenarienvergleich</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <ScenarioCard data={extendedReport.szenarien.bestCase} type="best" />
                  <ScenarioCard data={extendedReport.szenarien.realCase} type="real" />
                  <ScenarioCard data={extendedReport.szenarien.worstCase} type="worst" />
                </div>
              </section>

              {/* Kipppunkte */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-100/50">
                  <h3 className="text-xl font-black text-[#0f172a] mb-12 uppercase tracking-tight italic">Kritische Kipppunkte</h3>
                  <div className="space-y-10">
                    {extendedReport.kipppunkte.map((kp, i) => (
                      <div key={i} className="flex space-x-8 relative">
                        {i < extendedReport.kipppunkte.length - 1 && <div className="absolute left-[15px] top-10 bottom-[-40px] w-px bg-slate-100" />}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xs border border-rose-100 shadow-sm relative z-10">{i + 1}</div>
                        <div className="space-y-3">
                          <h4 className="font-black text-base text-slate-800 leading-tight">{kp.ereignis}</h4>
                          <div className="flex items-center space-x-3">
                             <span className="text-[9px] text-rose-600 font-black uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">Gefahr: {kp.gefahr}</span>
                          </div>
                          <p className="text-xs text-slate-500 italic leading-relaxed font-medium">{kp.praevention}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f1f5f9] p-12 rounded-[3rem] border-4 border-[#0f172a] flex flex-col relative group">
                  <div className="absolute top-8 right-8 grayscale opacity-[0.05] group-hover:opacity-10 transition-opacity">
                     <BlauesEchoLogo variant="icon" className="h-24" />
                  </div>
                  <div className="flex items-center space-x-4 mb-10">
                    <Clock className="w-7 h-7 text-[#0f172a]" />
                    <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight italic">Sensitivitätsanalyse</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed flex-grow font-bold">
                    {extendedReport.sensitivitaetsanalyse}
                  </p>
                  <div className="mt-12 pt-8 border-t border-slate-200 text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] text-center">
                    Modellrechnung • EchoScope by Blaues Echo
                  </div>
                </div>
              </section>
            </div>
          )}
        </section>

        {/* Legal Disclaimer */}
        <div className="no-export mt-16 p-8 bg-slate-50/50 rounded-3xl border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
            Diese Analyse ist ein Produkt von Blaues Echo. Sie dient der strukturierten Wirkungsabschätzung politischer Vorhaben. 
            Sie bewertet kommunikative Wirkung und politische Anschlussfähigkeit, trifft jedoch keine Aussage über die inhaltliche Richtigkeit, 
            Wahrheit, Moral oder rechtliche Zulässigkeit des Vorhabens. Alle Ergebnisse sind analytische Einschätzungen auf Basis von Sprachmodellen, keine Prognosen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
