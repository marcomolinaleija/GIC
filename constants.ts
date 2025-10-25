import { FaqItem } from './types';

export const FAQ_SUGGESTIONS: FaqItem[] = [
  {
    question: '¿Cómo creo una nueva imagen?',
    answer: '' // La respuesta ahora la dará la IA
  },
  {
    question: '¿Cómo edito una imagen existente?',
    answer: ''
  },
  {
    question: '¿Para qué sirve la pestaña "Explorar"?',
    answer: ''
  }
];

export const APP_CONTEXT_DATA = `
# MANUAL DE LA APLICACIÓN: ASISTENTE CREATIVO DE IMÁGENES

## Resumen General
Esta es una aplicación web para crear, editar y explorar imágenes usando inteligencia artificial. También tiene un asistente de ayuda. La aplicación tiene cuatro secciones principales accesibles desde la barra de navegación superior: "Crear", "Editar", "Explorar" y "Ayuda".

---

## 1. Sección: Crear
- **Propósito**: Generar una imagen completamente nueva a partir de una descripción de texto.
- **Cómo usar**:
    1.  **Describe la imagen**: En el campo de texto grande, el usuario debe escribir lo que quiere ver. Por ejemplo: "Un perro con gafas de sol en una playa".
    2.  **Proporción de Aspecto**: El usuario debe seleccionar un formato para la imagen del menú desplegable (cuadrado, paisaje, retrato, etc.).
    3.  **Generar**: Al hacer clic en el botón "Generar Imagen", la IA creará la imagen y la mostrará en el panel de la derecha.
    4.  **Descargar**: Una vez generada, el usuario puede pasar el ratón sobre la imagen para ver y hacer clic en un icono de descarga.

---

## 2. Sección: Editar
- **Propósito**: Modificar una o más imágenes existentes que el usuario suba.
- **Cómo usar**:
    1.  **Subir Imagen(es)**: El usuario hace clic en "Subir Imagen(es)" para seleccionar uno o más archivos de imagen de su dispositivo. Las imágenes subidas aparecerán como miniaturas.
    2.  **Descripción Automática**: Si el usuario sube UNA SOLA imagen, la IA la analizará y mostrará una breve descripción de su contenido. Esto no ocurre si se suben varias imágenes.
    3.  **Describe la edición**: En el campo de texto, el usuario escribe qué cambio quiere hacer. Si subió varias imágenes, puede referirse a ellas. Por ejemplo: "Cambia el color del cielo a naranja" o "Toma la persona de la primera imagen y ponla en el paisaje de la segunda".
    4.  **Editar**: Al hacer clic en "Editar Imagen", la IA procesará la petición y mostrará el resultado en el panel de la derecha.
    5.  **Descargar**: La imagen editada también tiene un botón de descarga.

---

## 3. Sección: Explorar
- **Propósito**: Subir una imagen y tener una conversación de chat (texto) sobre ella.
- **Cómo usar**:
    1.  **Subir Imagen**: El usuario sube una única imagen. La imagen se muestra a la izquierda.
    2.  **Descripción Inicial**: La IA proporciona automáticamente una descripción inicial de la imagen, que aparece como el primer mensaje en el chat de la derecha.
    3.  **Conversar**: El usuario puede hacer preguntas sobre la imagen en el campo de chat, como "¿De qué color es el coche?" o "¿Qué objetos hay en la mesa?". La IA responderá basándose en el contenido visual.
    4.  **Limpiar**: El botón con el icono de la papelera borra la imagen y la conversación para empezar de nuevo.

---

## 4. Sección: Ayuda
- **Propósito**: Es un chat de texto para resolver dudas sobre CÓMO USAR la aplicación.
- **Funcionamiento**: El asistente de ayuda (este mismo bot) utiliza este manual para responder a las preguntas del usuario.
- **Preguntas Frecuentes**: Hay botones con preguntas comunes para facilitar el acceso a la información.
- **Limpiar**: El botón con el icono de la papelera borra el historial del chat.
`;