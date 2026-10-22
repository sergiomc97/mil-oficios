# Mil Oficios

Web de "hazlo tú mismo" en español de España, publicada en https://miloficios.es con Hugo y GitHub Pages. Se monetiza con enlaces de afiliado. Firma: Tito Garlopa (seudónimo).

## Estructura

- `content/jardin/`, `content/arreglos/`, `content/restauracion/`: un `.md` por artículo.
- `temas.md`: lista de temas pendientes. Se escribe siempre el primero sin marcar de la lista con casillas; la sección «Ideas para más adelante» no se publica.
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

## Fotos

Sergio sube sus fotos a la carpeta «Imágenes» de Google Drive (id `1msSBp2MmkaFdZWRFnXRmyAoFgDu-AYEr`), compartida con la cuenta del conector. Puede que tengan nombre descriptivo o no.

En cada ejecución, antes de escribir el artículo:

1. Lista los archivos de la carpeta y descarta los que ya estén en `fotos.yaml`.
2. Descarga cada foto nueva y mírala. No se publica si se ve una cara, una matrícula, un número de casa, un cartel con el nombre del pueblo o una fachada reconocible: se registra como `descartada` con el motivo y se le avisa a Sergio.
3. Prepárala con `python3 scripts/fotos.py <descarga> assets/fotos/<slug-descriptivo>.jpg` (instala antes `pillow pillow-heif`). El script borra todos los metadatos, incluido el GPS, y la reduce a 1600 px.
4. Úsala en el artículo al que corresponda, ya publicado o el que se escribe ese día:
   - Como portada: `portada: fotos/<archivo>.jpg` y `portada_alt:` en el front matter. Se recorta sola en apaisado.
   - Dentro del texto: `{{< foto src="fotos/<archivo>.jpg" alt="…" pie="…" >}}` justo donde aporte.
   - Si no encaja en ningún artículo, regístrala con `uso: pendiente` y una descripción, para un tema futuro.
5. El `alt` describe con exactitud lo que se ve, en una frase. El `pie` es opcional.
6. Añade la foto a `fotos.yaml` con su `id`, `archivo` y `uso`.

Una foto de Sergio es una experiencia real: el texto puede mencionarla («así quedó mi franja junto al muro»), pero solo lo que se ve en ella.

## Experiencias reales de Sergio

Son las únicas que Tito Garlopa puede contar en primera persona, y solo en los artículos donde vengan a cuento. Nunca se dice dónde vive ni se dan datos que lo identifiquen.

- Su jardín está en una zona de interior con heladas de −10 a −15 °C, con terreno pedregoso y una parte en cuesta junto a un muro.
- Tiene una franja junto al muro con malla antihierbas y piedra volcánica, de 70 a 110 cm de ancho, con zonas de sol y de sombra.
- En esa franja los durillos van bien. Varios mirtos plantados a principios de julio estaban muy secos a principios de septiembre. La malla y la piedra hacen difícil ver si la tierra está húmeda.
- También ha tenido problemas con lavanda y romero en algunos puntos de la franja.
- Le regalaron un olivo de 60 a 80 cm en una maceta de 9 × 9 cm y dudó entre plantarlo en el suelo o pasarlo a una maceta grande.
- Ha querido envejecer una maceta de terracota para que pareciera antigua y blanquecina.
- En su dormitorio, la pared del cabecero está torcida y las esquinas no van a escuadra, lo que complica colocar papel pintado. Tenía una moldura blanca estrecha que se despegaba.
- Ha estudiado poner una tira LED de luz cálida en el perímetro del techo del dormitorio, de unos 15 m.
- Ha investigado estuco y microcemento para el baño.

De todo esto solo constan los problemas y lo que estudió, no el resultado final. No se cuenta como hecho algo que no consta, como «así quedó» o «lo instalé».

## Reglas que no se rompen

- No inventar experiencias personales de Tito Garlopa ("a mí me pasó", "en mi jardín"). Solo se usan las que Sergio haya contado.
- No inventar cifras, estudios ni precios. Cualquier dato concreto se comprueba antes con una búsqueda.
- En trabajos con electricidad, gas, productos químicos o alturas, avisar de los riesgos y de cuándo llamar a un profesional.
- Antes de publicar, `hugo --minify` debe terminar sin WARN ni ERROR.
