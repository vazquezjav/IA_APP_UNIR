# Guía de la Aplicación de Rastreo de Vuelos

Esta aplicación permite visualizar vuelos en tiempo real utilizando Angular y Node.js.

## Requisitos Previos
- Node.js (v18 o superior)
- NPM

## Instrucciones de Ejecución

### 1. Iniciar el Backend
El backend maneja la comunicación con la API de OpenSky y la autenticación simulada.

1.  Abre una terminal en `backend`.
2.  Instala las dependencias (si no lo has hecho):
    ```bash
    npm install
    ```
3.  Inicia el servidor:
    ```bash
    node server.js
    ```
    El servidor correrá en `http://localhost:3000`.

### 2. Iniciar el Frontend
El frontend es la aplicación Angular.

1.  Abre una nueva terminal en `frontend`.
2.  Instala las dependencias (si no lo has hecho):
    ```bash
    npm install
    ```
3.  Inicia la aplicación:
    ```bash
    npm start
    ```
    O si prefieres usar `ng serve` directamente:
    ```bash
    npx ng serve
    ```
4.  Abre tu navegador en `http://localhost:4200`.

## Características Implementadas

-   **Inicio**: Página de bienvenida con descripción de funciones.
-   **En Vivo**: Mapa interactivo (Leaflet) mostrando vuelos en tiempo real (limitado a 100 para demo).
-   **Equipo**: Información del equipo y formulario de contacto.
-   **Login/Registro**: Sistema de autenticación simulado (los datos se guardan en memoria del servidor).
-   **Estilo**: Diseño limpio con paleta Crema, Blanco y Verde Salvia.

## Notas
-   La API de OpenSky es pública y puede tener límites de velocidad. Si el mapa no carga vuelos, espera unos segundos y recarga.
-   Los datos de usuario se pierden al reiniciar el backend.
