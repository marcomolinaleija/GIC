import { GoogleGenAI, Modality, GenerateContentResponse, Chat, Content, LiveSession, LiveServerMessage } from "@google/genai";
import { AspectRatio, ChatMessage } from "../types";

const getAi = () => {
    // Per guidelines, create a new instance before API calls to use the latest key.
    return new GoogleGenAI({ apiKey: process.env.API_KEY! });
}

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
    const ai = getAi();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        if (base64ImageBytes) {
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const editImage = async (prompt: string, images: { imageData: string; mimeType: string }[]): Promise<string | null> => {
    const ai = getAi();
    if (images.length === 0) {
        console.error("No images provided for editing.");
        return null;
    }

    try {
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.imageData.split(',')[1],
                mimeType: image.mimeType,
            },
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    ...imageParts,
                    {
                        text: prompt,
                    },
                ],
            },
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
        return null;
    } catch (error) {
        console.error("Error editing image:", error);
        return null;
    }
};

export const describeImage = async (imageData: string, mimeType: string): Promise<string | null> => {
    const ai = getAi();
    const base64ImageData = imageData.split(',')[1];
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: "Describe esta imagen en español para una persona ciega. Sé conciso pero descriptivo.",
                    },
                ]
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error describing image:", error);
        return null;
    }
};

export const askAboutImage = async (imageData: string, mimeType: string, question: string): Promise<string | null> => {
    const ai = getAi();
    const base64ImageData = imageData.split(',')[1];
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: question,
                    },
                ]
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error asking about image:", error);
        return null;
    }
}

export const generateFaqResponse = async (question: string, history: ChatMessage[]): Promise<string> => {
    const ai = getAi();
    
    const geminiHistory: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));

    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: geminiHistory,
        config: {
            systemInstruction: 'Eres un asistente de preguntas frecuentes para una aplicación de creación y edición de imágenes con IA. Responde solo preguntas sobre cómo usar la aplicación. Si te preguntan algo más, amablemente di que no puedes responder a eso. Responde en español.',
        }
    });

    const result = await chat.sendMessage({ message: question });
    return result.text;
};

// FIX: Implement the missing 'createLiveSession' function for real-time conversation.
export const createLiveSession = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: any) => void;
    onclose: () => void;
}, voiceName: string): Promise<LiveSession> => {
    const ai = getAi();
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            systemInstruction: 'Eres un asistente de IA conversacional amigable y útil. Responde en español.',
        },
    });
};