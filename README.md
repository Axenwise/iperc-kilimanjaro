# IPERC post-test · Kilimanjaro Restaurant Café

Sitio de consulta de la matriz IPERC posterior a la aplicación del Plan de Seguridad
y Salud en el Trabajo. Está pensado para que cualquier trabajador, desde el celular,
encuentre en segundos los peligros de su puesto, cómo se hace bien la tarea, qué
equipo de protección usar y cómo actuar si el peligro llega a materializarse.

Empresa: HAPPY ZOO S.A.C. · Surco, Lima · Setiembre 2026.

---

## Qué incluye

| Sección | Contenido |
|---|---|
| **Panel** | Indicadores, comparación del nivel de riesgo antes y después, y la matriz de riesgo (probabilidad × gravedad) con el número de peligros en cada casilla |
| **Áreas** | Cocina, salón y lavado. Al tocar un área se filtran sus peligros |
| **Peligros** | Una ficha por peligro: qué puede pasar, el semáforo antes/hoy, cómo se hace bien la tarea, el EPP, qué hacer si pasa algo, lo ya implementado y lo pendiente |
| **Lista** | Tabla compacta de los 74 peligros |
| **Rutinas** | Las diez rutinas estándar RE-01 a RE-10 con su flujograma (simbología ISO 5807) |
| **Excel** | La matriz completa en `.xlsx`, general y por área, con hoja de resumen |

74 peligros · 3 áreas · 10 rutinas estándar.

---

## Publicar

### GitHub Pages

1. Crea un repositorio y sube el contenido de esta carpeta a la raíz.
2. *Settings → Pages → Source: Deploy from a branch*, rama `main`, carpeta `/ (root)`.
3. En unos minutos queda en `https://axenwise.github.io/iperc-kilimanjaro/`.

El archivo `.nojekyll` ya está incluido para que GitHub sirva las carpetas tal cual.

```bash
git init
git add .
git commit -m "Sitio de consulta del IPERC post-test"
git branch -M main
git remote add origin https://github.com/Axenwise/iperc-kilimanjaro.git
git push -u origin main
```

### Netlify

Arrastra la carpeta completa sobre *Sites* en app.netlify.com. El archivo `_headers`
ya trae las cabeceras de seguridad y de caché.

### Probar en tu computadora

El sitio carga los datos con `fetch`, así que **no funciona abriendo `index.html`
con doble clic** (el navegador lo bloquea por seguridad). Levanta un servidor:

```bash
python -m http.server 8000
```

y entra a `http://localhost:8000`.

---

## Estructura

```
.
├── index.html                  Página única con seis secciones
├── assets/
│   ├── css/estilo.css          Estilos, modo claro y oscuro
│   ├── js/app.js               Carga de datos, filtros y vistas
│   ├── datos/iperc.json        Los 74 peligros y las 10 rutinas
│   ├── img/                    Portada y fotos de área
│   └── flujos/                 Flujogramas RE-01 a RE-10 y sus miniaturas
├── descargas/                  Los cuatro libros de Excel
├── qr_iperc.png                Código QR del sitio
├── afiche_qr_A4.pdf            Afiche para imprimir y pegar en cada área
├── _headers                    Cabeceras para Netlify
└── .nojekyll                   Para GitHub Pages
```

## Actualizar los datos

Todo el contenido sale de `assets/datos/iperc.json`. Si cambia la matriz, se
regenera ese archivo y los libros de Excel; la dirección del sitio no cambia, así
que el código QR impreso sigue sirviendo.

## Notas

- El nivel de riesgo se calcula como **(A + B + C + D) × severidad**, según la
  R.M. N.° 050-2013-TR.
- Los flujogramas usan la simbología de la norma **ISO 5807**: óvalo de inicio y fin,
  rectángulo de actividad y rombo de decisión.
- El nivel de riesgo siempre aparece **escrito**, no solo en color, porque el naranja
  y el verde se confunden con daltonismo.
- Las fotografías son de Unsplash (licencia libre, uso comercial permitido).

---

Mendoza Soplopuco, Adrian Santos · Ramos Neyra, Anel Mileny
Universidad César Vallejo · Escuela Profesional de Ingeniería Industrial · 2026
