# El Álbum — Tracker de colecciones de figuritas

**Demo en vivo:** https://ifylopez.github.io/CollectionTracker/

Archivo personal para llevar el control de colecciones de figuritas y cartas de fútbol (mundiales, copas, ligas, fútbol argentino, etc.). Permite saber qué tengo, qué me falta, qué tengo pegado en el álbum, qué tengo suelto, y cuántas repetidas tengo para intercambio.

![estado](https://img.shields.io/badge/estado-funcional-success) ![stack](https://img.shields.io/badge/stack-React%20%2B%20Vite-blue)

## Características

- **Múltiples colecciones** con portada personalizable (subís la foto del álbum real).
- **Numeración flexible**: simple (1 a N), por secciones con prefijo (`ARG-1` a `ARG-20`), o especiales (`LE-1`, `BR-1`).
- **Tres estados por figurita**: falta / suelta / pegada en el álbum.
- **Contador de duplicados** para gestionar repetidas para intercambio.
- **Rareza por sección** (común / rara / épica / legendaria), visible en la grilla.
- **Marcado por rango** para cargar muchas figuritas de una vez (ej: `1-50, 73, 90-95`).
- **Exportar faltantes** como texto formateado, listo para mandar por WhatsApp.
- **Backup completo** a archivo JSON: tus datos viajan con vos.
- **Funciona 100% en el navegador**: sin servidor, sin cuenta, sin nada que registrar.

## Stack

- [React 18](https://react.dev/) con [Vite](https://vitejs.dev/) como bundler
- [Lucide Icons](https://lucide.dev/) para los íconos
- [Google Fonts](https://fonts.google.com/) (Fraunces, Inter, JetBrains Mono)
- `localStorage` como almacenamiento — sin backend

## Cómo correrlo en tu compu

### 1. Instalar Node.js (si no lo tenés)

Bajá la versión **LTS** desde [nodejs.org](https://nodejs.org/) y seguí el instalador. Después abrí una terminal (PowerShell en Windows) y verificá:

```bash
node --version
npm --version
```

Si ambos muestran un número de versión, estás listo.

### 2. Instalar las dependencias del proyecto

Desde la carpeta del proyecto:

```bash
npm install
```

(Esto crea la carpeta `node_modules` con todas las librerías. Tarda un poco la primera vez.)

### 3. Arrancarlo en modo desarrollo

```bash
npm run dev
```

Abrí en el navegador la URL que aparece en la terminal (normalmente `http://localhost:5173`).

### 4. Generar la versión para producción

```bash
npm run build
```

El resultado queda en la carpeta `dist/`, lista para subir a cualquier hosting estático.

## Cómo publicarlo en GitHub Pages

1. Subí el proyecto a un repositorio de GitHub (por ejemplo, `album-tracker`).
2. Abrí `vite.config.js` y verificá que `REPO_NAME` coincida con el nombre exacto del repositorio.
3. Desde la terminal:

   ```bash
   npm run deploy
   ```

   Esto compila el proyecto y publica la carpeta `dist/` en una rama llamada `gh-pages`.
4. En GitHub, andá a **Settings → Pages**, elegí la rama `gh-pages` como fuente y guardá.
5. En unos minutos la app va a estar accesible en:
   `https://TU-USUARIO.github.io/album-tracker/`

## Cómo se usan los datos

Los datos viven **en el navegador**, usando `localStorage`. Esto implica:

- No hay cuenta. No hay servidor. No hay nada que se mande a internet.
- Si limpiás los datos del navegador (cache, cookies, etc.) o usás modo incógnito, **se borran**.
- Si abrís la app en otra compu, **no tenés tus datos ahí**.

**Por eso, exportá un backup seguido.** El botón "Exportar backup" en el dashboard genera un archivo `.json` que podés guardar en Drive, mandar por mail, etc. Para restaurarlo, "Importar" en cualquier navegador.

## Estructura del proyecto

```
album-tracker/
├── index.html                # Entry HTML
├── package.json              # Dependencias y scripts
├── vite.config.js            # Config de Vite (incluye base path para GH Pages)
├── public/                   # Assets estáticos (vacío por ahora)
└── src/
    ├── main.jsx              # Entry de React
    ├── App.jsx               # Router principal y estado de la app
    ├── index.css             # Reset y estilos globales
    ├── lib/
    │   ├── theme.js          # Paleta, fuentes, rarezas
    │   ├── storage.js        # Wrapper de localStorage + export/import
    │   ├── utils.js          # Parseo de rangos, keys de figuritas, etc.
    │   └── imageCompress.js  # Compresión de portadas con canvas
    └── components/
        ├── ui.jsx            # Btn, FilterChip, Modal, inputStyle, etc.
        ├── Ring.jsx          # Anillo de progreso (SVG)
        ├── StickerCell.jsx   # Celda individual con long-press
        ├── DuplicateEditor.jsx
        ├── SectionEditor.jsx
        ├── CoverUploader.jsx
        ├── AlbumCard.jsx     # Tarjeta del dashboard
        ├── Dashboard.jsx     # Vista principal con masthead
        ├── AddAlbumView.jsx  # Form de creación/edición
        └── AlbumDetailView.jsx  # Vista de grilla con filtros
```

## Modelo de datos

Cada álbum es un objeto:

```js
{
  id: "abc123",
  name: "FIFA World Cup 2022",
  cover: "data:image/jpeg;base64,...", // o null
  color: "#C8302E",
  sections: [
    { id: "s1", name: "Argentina", prefix: "ARG", from: 1, to: 20, rarity: "common" },
    { id: "s2", name: "Legendarias", prefix: "LE", from: 1, to: 12, rarity: "legendary" },
  ],
  createdAt: 1718230000000,
}
```

Las figuritas se almacenan aparte, agrupadas por álbum:

```js
{
  "ARG-1": { count: 2, pasted: true },   // tengo 2, una está pegada
  "LE-5":  { count: 1, pasted: false },  // tengo 1 suelta
  // Las que faltan no aparecen en este objeto.
}
```

## Decisiones de diseño

- **Estética "archivo deportivo":** papel manila como fondo, tinta oscura, acento rojo periódico, tipografía Fraunces (serif con personalidad) para títulos y JetBrains Mono para los números de figuritas. Remite a un álbum físico bien cuidado o a un programa de partido vintage.
- **Long-press para duplicados:** la mayoría de los clics son para marcar tenencia básica. Los duplicados son una operación secundaria, por eso quedan detrás de un gesto deliberado (mantener apretado o clic derecho), evitando saturar la celda con controles.
- **Sin login ni backend:** simplifica todo. Tu colección es tuya. El precio es que tenés que exportar backups manualmente.

## Posibles mejoras a futuro

- Presets de colecciones conocidas verificadas (Mundial 2022 con sus secciones reales, etc.).
- Sincronización opcional con Google Drive o Dropbox para backup automático.
- Vista de "intercambio mutuo" cruzando tus repes con los faltantes de otro usuario.
- Modo offline como PWA instalable.
- Importar configuración de álbum desde un código compartido (sin importar todos los datos).

## Licencia

MIT — usalo y modificalo libremente.
