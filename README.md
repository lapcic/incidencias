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

## Nota
Esta versión utiliza `localStorage`, por lo que no necesita base de datos para funcionar como prototipo. Para producción se puede conectar a una API y una base de datos (SQL Server, MySQL o PostgreSQL), además de agregar autenticación y control de permisos.
