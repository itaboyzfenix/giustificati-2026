import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from "../constants";

export const generateFormalSummary = async (
  date: string, 
  justifiedNames: string[], 
  permanentNames: string[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Chiave API mancante. Impossibile generare il verbale.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Agisci come il Segretario di una Loggia Massonica.
    È la data del ${date}.
    
    Devi redigere un testo formale, solenne e fraterno da leggere durante la tornata o inviare via email.
    
    Elenco dei Fratelli scusati (assenti giustificati) per questa specifica tornata:
    ${justifiedNames.length > 0 ? justifiedNames.join(', ') : 'Nessuno.'}
    
    Elenco dei Fratelli ai ferri corti (giustificati permanenti/fissi):
    ${permanentNames.length > 0 ? permanentNames.join(', ') : 'Nessuno.'}
    
    Sei pregato di generare un testo breve ma elegante che elenchi i fratelli giustificati alla Tavola.
    Usa un linguaggio appropriato (es: "Tavola dei Giustificati", "Tornata", "Fratelli").
    Non aggiungere saluti iniziali troppo colloquiali. Vai dritto al punto con eleganza.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return response.text || "Impossibile generare il testo.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Si è verificato un errore durante la generazione del verbale.";
  }
};