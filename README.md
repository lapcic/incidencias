# Gestión de Incidencias RH — React

Aplicación React para registrar usuarios y gestionar incidencias de personal.

## Incluye
- Página de inicio con panel y accesos rápidos.
- Registro de usuarios: nombre, puesto, sucursal, horarios y fecha de nacimiento.
- Registro de incidencias con folio, datos del empleado, tipo de incidencia, justificación, fecha y horario.
- Opción de cambio 1 y opción de cambio 2.
- Validación con opciones de autorización y motivo de rechazo.
- Observaciones y firmas: Valida, Autoriza RH y Solicita.
- Persistencia local mediante `localStorage`.
- Búsqueda en usuarios e incidencias.
- Diseño responsive para escritorio y móvil.

## Ejecutar

```bash
npm install
npm run dev
```

Después abre la URL que indique Vite, normalmente `http://localhost:5173`.

## Generar producción

```bash
npm run build
npm run preview
```

## Base de datos local con XAMPP

1. Inicia **Apache** y **MySQL** desde el panel de XAMPP.
2. En phpMyAdmin crea una base de datos llamada `incidencias` e importa el esquema de tus tablas (`empleados`, `incidencias` y las relacionadas).
3. Entra a la carpeta `backend`, instala sus dependencias y copia `.env.example` como `.env`:

```bash
cd backend
npm install
copy .env.example .env
npm start
```

La conexión usa por defecto `root` sin contraseña en `127.0.0.1:3306`. Si tu instalación de XAMPP tiene otros datos, edita `.env` antes de iniciar el backend.

## API publicada

El frontend usa por defecto la API publicada en Render:
`https://api-incidencias-b1jk.onrender.com`.

Para apuntar a otra API durante el desarrollo, define `VITE_API_URL` antes de ejecutar Vite.
