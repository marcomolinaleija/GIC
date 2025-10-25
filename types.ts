
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export type View = 'creator' | 'editor' | 'faq';

export interface VoiceOption {
  name: string;
  label: string;
}

export interface UploadedImage {
  dataUrl: string;
  mimeType: string;
  name: string;
}
