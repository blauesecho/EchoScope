
export interface TargetGroupAnalysis {
  name: string;
  kernbotschaft: string;
  argumentationslogik: string;
  emotionalerHebel: string;
  sprachstil: string;
  erfolgswahrscheinlichkeit: number;
  begruendung: string;
}

export interface PoliticalReport {
  projektueberblick: string;
  konfliktlinien: string[];
  zielgruppen: TargetGroupAnalysis[];
  gesamtbewertung: string;
  hauptrisiken: string[];
  kommunikationsempfehlung: {
    framing: string;
    begriffe: string[];
    noGos: string[];
  };
}

export interface Scenario {
  titel: string;
  beschreibung: string;
  eintrittswahrscheinlichkeit: string;
  auswirkung: string;
}

export interface ExtendedReport {
  milieuSegmentierung: {
    name: string;
    beschreibung: string;
    affinitaet: number;
  }[];
  alternativeNarrative: {
    titel: string;
    ansatz: string;
    vorteil: string;
  }[];
  szenarien: {
    bestCase: Scenario;
    realCase: Scenario;
    worstCase: Scenario;
  };
  kipppunkte: {
    ereignis: string;
    gefahr: string;
    praevention: string;
  }[];
  sensitivitaetsanalyse: string;
}

export interface SavedReport {
  id: string;
  timestamp: number;
  projectDescription: string;
  report: PoliticalReport;
  extendedReport?: ExtendedReport;
}
