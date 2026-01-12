
import { GoogleGenAI, Type } from "@google/genai";
import { PoliticalReport, ExtendedReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_INSTRUCTION = `Du bist EchoScope, ein hochspezialisiertes Analyse-Modul von 'Blaues Echo'.
Deine Aufgabe ist die rein analytische Bewertung politischer Vorhaben.
PRINZIP: Wirkung statt Meinung.
- Keine Aktivierung, keine Kampagnenlogik.
- Keine moralischen oder normativen Urteile (nicht 'gut' oder 'falsch').
- Fokus auf Resonanz, Akzeptanz und Kommunikationslogik.
- Sprache: Sachlich, nüchtern, professionell (Deutsch).`;

export const analyzePoliticalProject = async (projectDescription: string): Promise<PoliticalReport> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analysiere die Wirkung von: "${projectDescription}"`,
    config: {
      systemInstruction: `${BASE_INSTRUCTION}
Analysiere strukturiert:
1. Projektüberblick (neutral, faktisch)
2. Zentrale Konfliktlinien (gesellschaftlich & politisch)
3. Resonanz nach gesellschaftlichen Gruppen:
   - Studierende / junge Erwachsene
   - Progressiv / links
   - Konservativ / wertorientiert
   - Wirtschaft / Mittelstand
   - Kommunalpolitisch-pragmatisch
   - Skeptische / politikmüde Bürger

Liefere das Ergebnis STRENG im JSON-Format gemäß des Schemas.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projektueberblick: { type: Type.STRING },
          konfliktlinien: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          zielgruppen: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                kernbotschaft: { type: Type.STRING },
                argumentationslogik: { type: Type.STRING },
                emotionalerHebel: { type: Type.STRING },
                sprachstil: { type: Type.STRING },
                erfolgswahrscheinlichkeit: { type: Type.NUMBER },
                begruendung: { type: Type.STRING }
              },
              required: ["name", "kernbotschaft", "argumentationslogik", "emotionalerHebel", "sprachstil", "erfolgswahrscheinlichkeit", "begruendung"]
            }
          },
          gesamtbewertung: { type: Type.STRING },
          hauptrisiken: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          kommunikationsempfehlung: {
            type: Type.OBJECT,
            properties: {
              framing: { type: Type.STRING },
              begriffe: { type: Type.ARRAY, items: { type: Type.STRING } },
              noGos: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["framing", "begriffe", "noGos"]
          }
        },
        required: ["projektueberblick", "konfliktlinien", "zielgruppen", "gesamtbewertung", "hauptrisiken", "kommunikationsempfehlung"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Keine Antwort vom Modell erhalten.");
  return JSON.parse(text) as PoliticalReport;
};

export const deepenPoliticalAnalysis = async (projectDescription: string, initialReport: PoliticalReport): Promise<ExtendedReport> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Vertiefe die Wirkungsanalyse für: "${projectDescription}". Erstbericht: ${JSON.stringify(initialReport)}`,
    config: {
      systemInstruction: `${BASE_INSTRUCTION}
Erstelle die zweite Analyseebene für komplexe Vorhaben.
Analysiere:
1. Feinere Milieu-Segmentierung (Sinus-Stil)
2. Alternative Kommunikationsnarrative
3. Szenarienvergleich (Best/Real/Worst)
4. Kritische Kipppunkte der Wahrnehmung
5. Sensitivitätsanalyse der Akzeptanz.

Liefere das Ergebnis STRENG im JSON-Format gemäß des Schemas.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          milieuSegmentierung: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                beschreibung: { type: Type.STRING },
                affinitaet: { type: Type.NUMBER }
              },
              required: ["name", "beschreibung", "affinitaet"]
            }
          },
          alternativeNarrative: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                titel: { type: Type.STRING },
                ansatz: { type: Type.STRING },
                vorteil: { type: Type.STRING }
              },
              required: ["titel", "ansatz", "vorteil"]
            }
          },
          szenarien: {
            type: Type.OBJECT,
            properties: {
              bestCase: { 
                type: Type.OBJECT, 
                properties: { titel: {type: Type.STRING}, beschreibung: {type: Type.STRING}, eintrittswahrscheinlichkeit: {type: Type.STRING}, auswirkung: {type: Type.STRING} },
                required: ["titel", "beschreibung", "eintrittswahrscheinlichkeit", "auswirkung"]
              },
              realCase: { 
                type: Type.OBJECT, 
                properties: { titel: {type: Type.STRING}, beschreibung: {type: Type.STRING}, eintrittswahrscheinlichkeit: {type: Type.STRING}, auswirkung: {type: Type.STRING} },
                required: ["titel", "beschreibung", "eintrittswahrscheinlichkeit", "auswirkung"]
              },
              worstCase: { 
                type: Type.OBJECT, 
                properties: { titel: {type: Type.STRING}, beschreibung: {type: Type.STRING}, eintrittswahrscheinlichkeit: {type: Type.STRING}, auswirkung: {type: Type.STRING} },
                required: ["titel", "beschreibung", "eintrittswahrscheinlichkeit", "auswirkung"]
              }
            },
            required: ["bestCase", "realCase", "worstCase"]
          },
          kipppunkte: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ereignis: { type: Type.STRING },
                gefahr: { type: Type.STRING },
                praevention: { type: Type.STRING }
              },
              required: ["ereignis", "gefahr", "praevention"]
            }
          },
          sensitivitaetsanalyse: { type: Type.STRING }
        },
        required: ["milieuSegmentierung", "alternativeNarrative", "szenarien", "kipppunkte", "sensitivitaetsanalyse"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Keine Antwort vom Modell erhalten.");
  return JSON.parse(text) as ExtendedReport;
};
