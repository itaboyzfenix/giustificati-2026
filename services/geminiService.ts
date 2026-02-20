import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from "../constants";

export const generateFormalSummary = async (
  date: string, 
  justifiedNames: string[], 
  permanentNames: string[],
  sickBrethren: string[],
  program: string,
  totalPresent: number
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Chiave API mancante. Impossibile generare il verbale.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Agisci come il Segretario di una Loggia Massonica.
    È la data del ${date}.
    
    Devi redigere un testo formale, solenne e fraterno da leggere durante la tornata o inviare via email.
    
    Dati della tornata:
    - Fratelli Presenti: ${totalPresent}
    - Fratelli scusati (assenti giustificati): ${justifiedNames.length > 0 ? justifiedNames.join(', ') : 'Nessuno.'}
    - Fratelli ai ferri corti (giustificati permanenti/fissi): ${permanentNames.length > 0 ? permanentNames.join(', ') : 'Nessuno.'}
    - Fratelli ammalati o in difficoltà (riferiti dal Fratello Ospitaliere): ${sickBrethren.length > 0 ? sickBrethren.join(', ') : 'Nessuno segnalato.'}
    - Programma/Lavori della giornata: ${program || 'Lavori di routine.'}
    
    Sei pregato di generare un testo elegante e conciso. 
    Inizia con un riferimento alla Tavola dei Giustificati e al numero di fratelli presenti che decorano le colonne.
    Prosegui con il saluto ai Fratelli che soffrono (segnalati dall'Ospitaliere) affinché la Loggia possa inviare loro un triplice fraterno abbraccio, e concludi accennando ai lavori previsti dal programma.
    Usa un linguaggio massonico appropriato (es: "Tavola dei Giustificati", "Tronco della Vedova", "Fratello Ospitaliere", "Oriente", "Colonne decorate").
    Mantieni un tono solenne.
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