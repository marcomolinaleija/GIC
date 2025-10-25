import { FaqItem, VoiceOption } from './types';

export const PREBUILT_VOICES: VoiceOption[] = [
    { name: 'Kore', label: 'Kore (Femenina)' },
    { name: 'Puck', label: 'Puck (Masculina)' },
    { name: 'Charon', label: 'Charon (Masculina)' },
    { name: 'Fenrir', label: 'Fenrir (Femenina)' },
    { name: 'Zephyr', label: 'Zephyr (Femenina)' },
];

export const FAQ_DATA: FaqItem[] = [
  {
    question: '¿Cómo creo una nueva imagen?',
    answer: 'Ve a la sección "Crear Imagen". Escribe una descripción detallada de la imagen que quieres en el campo de texto. Por ejemplo, "un gato astronauta flotando en el espacio con la Tierra de fondo". Selecciona la proporción de aspecto deseada y haz clic en "Generar".'
  },
  {
    question: '¿Cómo edito una imagen existente?',
    answer: 'Navega a la sección "Editar Imagen". Primero, sube un archivo de imagen desde tu dispositivo. Una vez cargada, aparecerá una descripción de la imagen en pantalla. Luego, en el campo de texto, escribe las modificaciones que deseas hacer, como "añade un sombrero de fiesta al perro" o "cambia el fondo a una playa". Haz clic en "Editar" y verás la imagen modificada.'
  },
  {
    question: '¿Esta aplicación es accesible para personas ciegas?',
    answer: '¡Sí! La aplicación ha sido diseñada pensando en la accesibilidad. Utilizamos etiquetas ARIA, HTML semántico y un alto contraste. Es totalmente navegable con teclado y lectores de pantalla.'
  }
];
