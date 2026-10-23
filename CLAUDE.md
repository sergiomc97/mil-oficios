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
- `resumen`: exactamente 3 frases cortas. Es el único resumen del artículo.
- `pasos` (solo si es un procedimiento): lista de `titulo`, `tiempo`, `texto`. Se coloca en el cuerpo con `{{< pasos >}}` justo después de la introducción.
- `error` (opcional): un error típico que NO se cuente ya en el cuerpo, en una o dos frases. Si no hay ninguno nuevo, se omite.
- `productos` (opcional): lista de `nombre`. Sin `url` hasta que la afiliación esté aprobada.

Cuerpo: introducción corta y luego secciones `##`. Entre 450 y 800 palabras: mejor corto y denso que largo y repetido.

## Cómo escribir

El lector tiene que notar que lo escribe una persona que ha hecho las cosas, no una ficha técnica. El fallo que más se nota es repetir: contar lo mismo en el resumen, en la introducción, en cada sección y otra vez en el error típico.

### Antes de escribir

- Apunta las 4 a 6 ideas del artículo. Cada idea va en un solo sitio del cuerpo. Si aparece en dos secciones, sobra en una.
- Elige la forma según el tema, no por costumbre. Un procedimiento lleva pasos; una comparación de tres o más cosas, una tabla; un diagnóstico, preguntas; una experiencia, se cuenta. No todos los artículos llevan tabla, lista y pasos.

### Al escribir

- Tutea y explica como a un vecino por encima de la valla: concreto, práctico, sin tono de folleto ni de manual.
- Mezcla frases cortas con otras más largas. Una subordinada de vez en cuando hace que el texto respire. Párrafos de 2 a 4 líneas en el móvil.
- Lo concreto antes que lo general: «la esquina de baldosas del vecino» mejor que «un lugar soleado con buen drenaje».
- Opina cuando toque («yo no lo haría», «sale más a cuenta cambiarla») y di claramente lo que no se sabe.
- La introducción engancha con algo concreto (una situación, una foto, un problema real). No adelanta las ideas del resumen.
- Títulos de sección como los escribiría una persona: una pregunta o una frase normal. No todos con el molde «X: Y».
- No cierres cada sección con una moraleja ni el artículo con un resumen. Termina cuando se acabe lo útil.
- Listas solo para lo que de verdad es una lista. No pongas negrita al principio de cada punto por sistema.
- Expresiones prohibidas, porque delatan texto automático: «no es X, es Y», «la diferencia (casi nunca) es…», «la clave es», «el secreto», «ojo con», «en resumen», «así de sencillo», «hay pocas cosas tan…», «dos X, dos destinos», «te contamos», «descubre», «sin más».

### Revisión, siempre

Con el borrador terminado, léelo entero de corrido, como lo leería Sergio en el móvil, y haz una pasada solo para quitar:

1. Ideas repetidas: cada una debe aparecer una vez en el cuerpo, más el resumen.
2. Expresiones prohibidas. Búscalas con:
   `grep -inE "no es [^.]*, es |la diferencia|la clave|el secreto|ojo con|en resumen|así de sencillo|hay pocas|dos destinos|te contamos|descubre|sin más" <archivo>`
3. Relleno: si una frase se puede quitar sin perder información, se quita.
4. El `error`: si repite algo del cuerpo, cámbialo por otro o bórralo.

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

### Fotos de banco (Pixabay)

Solo para artículos sin ninguna foto de Sergio. La clave de API viene en el prompt de la tarea programada: nunca se escribe en el repositorio, que es público.

1. Busca en inglés, que da mejores resultados: `curl -s -A "curl/8.5.0" "https://pixabay.com/api/?key=<CLAVE>&q=<términos>&image_type=photo&orientation=horizontal&safesearch=true&per_page=8"`.
2. Descarga las vistas previas (`webformatURL`) y míralas. Elige la que muestre de verdad lo que trata el artículo. Si ninguna encaja, mejor sin foto que con una de relleno.
3. Descarga `largeImageURL` y prepárala con `scripts/fotos.py` como `assets/fotos/<slug>-pixabay.jpg`.
4. Ponla de portada con `portada`, `portada_alt` y `portada_credito: Foto de <user> en Pixabay`.
5. Nunca se presenta como de Sergio ni se habla de ella en primera persona.
6. Regístrala en `fotos.yaml` con `id: pixabay-<id>`, `origen: pixabay`, `autor`, `url` (el `pageURL`), `archivo` y `uso`.

Si después llega una foto de Sergio para ese artículo, sustituye a la de Pixabay.

Una foto de Sergio es una experiencia real: el texto puede mencionarla («así quedó mi franja junto al muro»), pero solo lo que se ve en ella.

## Experiencias reales de Sergio

Son las únicas que Tito Garlopa puede contar en primera persona, y solo en los artículos donde vengan a cuento. Nunca se dice dónde vive ni se dan datos que lo identifiquen.

- Su jardín está en una zona de interior con heladas de −10 a −15 °C, con terreno pedregoso y una parte en cuesta junto a un muro.
- Tiene una franja junto al muro con malla antihierbas y piedra volcánica, de 70 a 110 cm de ancho, con zonas de sol y de sombra.
- En esa franja los durillos van bien. Varios mirtos plantados a principios de julio estaban muy secos a principios de septiembre. La malla y la piedra hacen difícil ver si la tierra está húmeda.
- También ha tenido problemas con lavanda y romero en algunos puntos de la franja. Confirmado por foto: una de sus lavandas se murió y quedó como una mata gris y seca en tierra pedregosa (`fotos/lavanda-seca.jpg`).
- Un vecino tiene a pocos metros una lavanda enorme y en flor, a pleno sol, en una esquina de pavimento con gravilla (`fotos/lavanda-vecino.jpg`). Es del vecino: nunca se presenta como de Sergio.
- Le regalaron un olivo de 60 a 80 cm en una maceta de 9 × 9 cm y dudó entre plantarlo en el suelo o pasarlo a una maceta grande.
- Ha querido envejecer una maceta de terracota para que pareciera antigua y blanquecina.
- En su dormitorio, la pared del cabecero está torcida y las esquinas no van a escuadra, lo que complica colocar papel pintado. Tenía una moldura blanca estrecha que se despegaba.
- Ha estudiado poner una tira LED de luz cálida en el perímetro del techo del dormitorio, de unos 15 m.
- Confirmado por foto: el dormitorio ya tiene papel pintado de ramas verdes sobre fondo beige y una tira LED cálida en el remate del techo de madera (`fotos/papel-pintado-dormitorio*.jpg`).
- Ha investigado estuco y microcemento para el baño.

De todo esto solo constan los problemas y lo que estudió, no el resultado final. No se cuenta como hecho algo que no consta, como «así quedó» o «lo instalé».

## Reglas que no se rompen

- No inventar experiencias personales de Tito Garlopa ("a mí me pasó", "en mi jardín"). Solo se usan las que Sergio haya contado.
- No inventar cifras, estudios ni precios. Cualquier dato concreto se comprueba antes con una búsqueda.
- En trabajos con electricidad, gas, productos químicos o alturas, avisar de los riesgos y de cuándo llamar a un profesional.
- Antes de publicar, `hugo --minify` debe terminar sin WARN ni ERROR.
