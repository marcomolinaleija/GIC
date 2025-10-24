import { GoogleGenAI, Modality } from '@google/genai';
import { AspectRatio } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY! });

/**
 * Converts a file to a base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

/**
 * Generates an image using imagen-4.0-generate-001.
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
    throw new Error('No se generaron imágenes.');
  } catch (error) {
    console.error('Error generando imagen:', error);
    throw new Error('No se pudo generar la imagen.');
  }
};


/**
 * Analyzes an image using gemini-2.5-flash.
 */
export const analyzeImage = async (file: File): Promise<string> => {
    const base64Data = await fileToBase64(file);
    const imagePart = {
        inlineData: {
            mimeType: file.type,
            data: base64Data,
        },
    };
    const textPart = {
        text: 'Describe esta imagen en detalle para una persona ciega. Sé muy específico sobre los objetos, colores, composición y cualquier texto visible.'
    };
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error('Error analizando la imagen:', error);
        throw new Error('No se pudo analizar la imagen.');
    }
};

/**
 * Edits an image using gemini-2.5-flash-image.
 */
export const editImage = async (prompt: string, file: File): Promise<string> => {
    const base64Data = await fileToBase64(file);
    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: file.type,
        },
    };
    const textPart = { text: prompt };
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error('No se recibió ninguna imagen editada.');

    } catch (error) {
        console.error('Error editando la imagen:', error);
        throw new Error('No se pudo editar la imagen.');
    }
};

/**
 * Generates a text response for the chatbot.
 */
export const generateChatResponse = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: 'Eres un bot de ayuda para una aplicación de creación de imágenes para personas con discapacidad visual. Responde de manera concisa y clara a las preguntas sobre cómo usar la aplicación.',
            },
        });
        return response.text;
    } catch (error) {
        console.error('Error en el chat de ayuda:', error);
        throw new Error('No se pudo obtener una respuesta del bot de ayuda.');
    }
};

/**
 * Converts text to speech using gemini-2.5-flash-preview-tts.
 */
export const textToSpeech = async (text: string, voiceName: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio ?? null;
    } catch (error) {
        console.error('Error en la conversión de texto a voz:', error);
        throw new Error('No se pudo convertir el texto a voz.');
    }
};
