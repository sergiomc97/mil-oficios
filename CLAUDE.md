# Mil Oficios

Web de "hazlo tú mismo" en español de España, publicada en https://miloficios.es con Hugo y GitHub Pages. Se monetiza con enlaces de afiliado. Firma: Tito Garlopa (seudónimo).

## Estructura

- `content/jardin/`, `content/arreglos/`, `content/restauracion/`: un `.md` por artículo.
- `temas.md`: lista de temas pendientes. Se escribe siempre el primero sin marcar.
- `data/trucos.yaml`: trucos cortos del carrusel de la portada.
- Cada push a `main` se publica solo con `.github/workflows/publicar.yml`.

## Formato de un artículo

Front matter:

- `title`: claro, con la palabra que buscaría la gente.
- `date`: la fecha de hoy.
- `description`: una frase de 155 caracteres como máximo.
- `tiempo`: minutos de lectura a 200 palabras por minuto, como `5 min`.
- `dificultad`: `baja`, `media` o `alta`.
- `resumen`: exactamente 3 frases cortas.
- `pasos` (solo si es un procedimiento): lista de `titulo`, `tiempo`, `texto`. Se coloca en el cuerpo con `{{< pasos >}}` justo después de la introducción.
- `error`: el error típico, en una o dos frases.
- `productos` (opcional): lista de `nombre`. Sin `url` hasta que la afiliación esté aprobada.

Cuerpo: introducción de 2 párrafos cortos, luego secciones `##`. Entre 500 y 900 palabras.

## Estilo

- Tuteo, frases cortas, párrafos de 2 a 4 líneas, para leer en el móvil.
- Que el formato varíe: listas, tablas, pasos, avisos. Nada de bloques largos de texto seguidos.
- Útil antes que bonito: cada sección responde a una duda concreta.

## Reglas que no se rompen

- No inventar experiencias personales de Tito Garlopa ("a mí me pasó", "en mi jardín"). Solo se usan las que Sergio haya contado.
- No inventar cifras, estudios ni precios. Cualquier dato concreto se comprueba antes con una búsqueda.
- En trabajos con electricidad, gas, productos químicos o alturas, avisar de los riesgos y de cuándo llamar a un profesional.
- Antes de publicar, `hugo --minify` debe terminar sin WARN ni ERROR.
