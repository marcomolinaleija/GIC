# Asistente Creativo de Imágenes Accesible

Este proyecto es una aplicación web interactiva que funciona como un asistente creativo para la generación y edición de imágenes, impulsado por la API de Google Gemini. La aplicación está diseñada desde cero con un enfoque en la accesibilidad, asegurando que pueda ser utilizada por personas con discapacidad visual a través de lectores de pantalla y navegación por teclado.

**Nota importante:** Este proyecto está siendo desarrollado de forma iterativa por el modelo de IA **Gemini de Google**, a través de conversaciones dentro del entorno de **AI Studio**.

## Características Principales

El asistente creativo se divide en tres funcionalidades principales:

### 1. Creación de Imágenes

- **Generación a partir de texto:** Los usuarios pueden escribir una descripción detallada (un "prompt") de la imagen que desean crear.
- **Selección de Proporción:** Permite elegir entre varias proporciones de aspecto comunes (cuadrado, paisaje, retrato, etc.) para adaptar la imagen a diferentes formatos.
- **Retroalimentación Accesible:** La aplicación utiliza atributos ARIA para anunciar el estado del proceso (ej. "Generando tu imagen...", "¡Tu imagen ha sido creada!"), haciendo que la experiencia sea transparente para los usuarios de lectores de pantalla.

### 2. Edición de Imágenes

- **Carga Múltiple de Imágenes:** A diferencia de muchos editores simples, esta aplicación permite subir varias imágenes a la vez para realizar ediciones complejas que las combinen.
- **Edición Guiada por Texto:** Los usuarios describen los cambios que desean realizar en las imágenes cargadas. Por ejemplo: "Toma a la persona de la primera imagen y colócala en el fondo de la segunda" o "Cambia el color del coche a rojo".
- **Descripción Automática:** Al subir una sola imagen, la IA genera automáticamente una descripción de su contenido, lo cual es útil para la accesibilidad y como punto de partida para la edición.

### 3. Asistente de Ayuda (FAQ)

- **Chatbot Inteligente:** Un bot conversacional responde preguntas sobre cómo utilizar la aplicación.
- **Sugerencias Rápidas:** Ofrece botones con preguntas frecuentes para que los usuarios puedan obtener ayuda sin necesidad de escribir.
- **Consciente del Contexto:** El chatbot mantiene el historial de la conversación para dar respuestas más coherentes.

## Desarrollo y Pruebas Locales

Para ejecutar esta aplicación en tu máquina local, sigue estos pasos.

### Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- Un gestor de paquetes como `npm` o `yarn`

### Instalación

1.  Clona el repositorio en tu máquina local (o descarga los archivos del proyecto).
2.  Navega al directorio del proyecto en tu terminal.
3.  Instala todas las dependencias necesarias ejecutando:

    ```bash
    npm install
    ```

### Configuración de la Clave de API

La aplicación requiere una clave de API de Google Gemini para funcionar.

1.  Obtén tu clave de API desde [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  En la raíz del proyecto, crea un nuevo archivo llamado `.env`.
3.  Añade tu clave de API al archivo `.env` de la siguiente manera:

    ```
    API_KEY='TU_CLAVE_DE_API_AQUI'
    ```

    Reemplaza `TU_CLAVE_DE_API_AQUI` con la clave que obtuviste.

### Ejecutar la Aplicación

Una vez que hayas instalado las dependencias y configurado tu clave de API, puedes iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en tu navegador en `http://localhost:3000`.

## Tecnologías Utilizadas

- **Framework:** React
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Bundler:** Vite
- **IA Generativa:** Google Gemini API (`@google/genai`)
