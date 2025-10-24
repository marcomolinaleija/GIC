import { VoiceOption, FaqItem } from './types';

export const PREBUILT_VOICES: VoiceOption[] = [
    { id: 'Kore', name: 'Kore (Femenina)', gender: 'Femenina'},
    { id: 'Puck', name: 'Puck (Masculina)', gender: 'Masculina'},
    { id: 'Zephyr', name: 'Zephyr (Masculina)', gender: 'Masculina'},
    { id: 'Charon', name: 'Charon (Masculina)', gender: 'Masculina'},
    { id: 'Fenrir', name: 'Fenrir (Femenina)', gender: 'Femenina'},
];

export const FAQ_DATA: FaqItem[] = [
  {
    question: '¿Cómo creo una nueva imagen?',
    answer: 'Ve a la sección "Crear Imagen". Escribe una descripción detallada de la imagen que quieres en el campo de texto. Por ejemplo, "un gato astronauta flotando en el espacio con la Tierra de fondo". Selecciona la proporción de aspecto deseada y haz clic en "Generar". El asistente te leerá la confirmación y la descripción de la imagen generada.'
  },
  {
    question: '¿Cómo edito una imagen existente?',
    answer: 'Navega a la sección "Editar Imagen". Primero, sube un archivo de imagen desde tu dispositivo. Una vez cargada, el asistente analizará y describirá la imagen para ti. Luego, en el campo de texto, escribe las modificaciones que deseas hacer, como "añade un sombrero de fiesta al perro" o "cambia el fondo a una playa". Haz clic en "Editar" y el asistente te presentará la imagen modificada.'
  },
  {
    question: '¿Cómo cambio la voz del asistente?',
    answer: 'En la parte superior de la página, encontrarás un menú desplegable para seleccionar la voz. Puedes elegir entre varias opciones. Usa el botón "Probar Voz" para escuchar una muestra de la voz seleccionada antes de decidir.'
  },
  {
    question: '¿Esta aplicación es accesible para personas ciegas?',
    answer: '¡Sí! La aplicación ha sido diseñada desde cero pensando en la accesibilidad. Utilizamos etiquetas ARIA, HTML semántico y un alto contraste. Todas las acciones importantes y los resultados son comunicados por voz, y es totalmente navegable con teclado y lectores de pantalla.'
  }
];