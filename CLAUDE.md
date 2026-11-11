# Mil Oficios

Web de "hazlo tú mismo" en español de España, publicada en https://miloficios.es con Hugo y GitHub Pages. Se monetiza con enlaces de afiliado. Firma: Tito Garlopa (seudónimo).

## Estructura

- `content/jardin/`, `content/arreglos/`, `content/restauracion/`, `content/negocio/`: un `.md` por artículo. `negocio` es para dueños de tiendas y pequeños comercios: TPV, impresoras de tickets, cajones, balanzas, datáfonos y obligaciones de la caja.
- `temas.md`: lista de temas pendientes, repartidos entre secciones, con las búsquedas reales que responde cada uno y una idea de vídeo para TikTok. Se escribe siempre el primero sin marcar de la lista con casillas; la sección «Ideas para más adelante» no se publica. Los temas de la estación en curso o la que empieza van delante: al añadir temas, si uno es de temporada, colócalo antes de los que no lo son.
- `negocio` lleva como mucho un artículo al mes. `mil-panes` no entra en la lista (ver «Mil Panes»).
- `busquedas.md`: búsquedas de la web que no encontraron nada el mes anterior, con cuántas veces se buscaron. Lo genera `.github/workflows/busquedas.yml` el día 1 de cada mes; no se edita a mano.
- Portada (`layouts/home.html`), en este orden: «Este mes en casa» (tareas de `data/meses.yaml` y enlace al aviso de heladas), «¿Qué te pasa?» (herramientas con `destacada`), «Cuaderno de Tito» (artículos con portada de Sergio), la última receta de Mil Panes y «Guías» (el resto de artículos, agrupados por sección). Los artículos de `negocio` no salen en la portada: solo un enlace a su sección.
- `data/tienda.yaml`: productos de la tienda de Ko-fi. Cada uno sale como tarjeta al final de los artículos de su `seccion`.
- Cada push a `main` se publica solo con `.github/workflows/publicar.yml`.

## Diseño

- Todo bloque de contenido va en una card de cristal, en toda la web: artículos (`.baldosa`, `.destacado`), filas de herramientas (`.util`), el panel de una herramienta (`.herramienta`) y los bloques de texto como «Este mes» o cada grupo de guías (`.panel`). No se mezclan bloques con card y bloques sin ella.
- Un bloque nuevo usa una de esas clases; no se inventa otro tipo de caja.
- El fondo son dos luces suaves y fijas (arriba a la izquierda y abajo a la derecha), del color de la sección o neutras en la portada. Solo están para que el cristal se note: nada de manchas de varios colores.
- En la portada el fondo es la acuarela de Sergio (`assets/fondo/acuarela*.webp`, con velo oscuro en modo oscuro) y `assets/js/cristal.js` (WebGL, shader de `@ybouane/liquidglass`) curva ese fondo en el borde de cada card; el interior queda liso. Es una mejora progresiva: sin WebGL o con `prefers-reduced-transparency` queda el cristal de CSS sobre la misma acuarela. El resto de la web sigue con las dos luces.
- La sección se marca siempre igual: etiqueta redonda con su color, o el icono de la sección en un cuadrado de ese color.
- Antes de borrar estilos de `assets/css/main.css`, comprueba qué selectores desaparecen comparando con la versión anterior.

## Herramientas

- `content/herramientas/`: calculadoras y diagnósticos, uno por página. Front matter: `herramienta` (clave en `assets/js/herramientas.js`), `seccion` (color) y `relacionado` (ruta del artículo, como `/arreglos/papel-pintado-pared-torcida`).
- El artículo relacionado muestra solo un enlace a su herramienta.
- «¿Lo arreglo o lo tiro?» (`lo-arreglo-o-lo-tiro.md`) lee sus aparatos y averías de `data/arreglos.yaml`. Si un artículo nuevo explica cómo arreglar una avería de un aparato o mueble, añade esa avería (o el aparato) con `articulo:` apuntando al artículo. Los datos se comprueban como cualquier otro: nada de precios con cifras sin fuente.
- Al publicar un artículo de un tema que ya tiene herramienta sin `relacionado`, añádeselo: la tira LED → `calculadora-tira-led.md`; la impresora de tickets → `diagnostico-impresora-tickets.md`.

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
- `lastmod` (opcional): solo al revisar de verdad un artículo ya publicado, con la fecha de la revisión. Hace que salga «actualizado el…».

Cuerpo: introducción corta y luego secciones `##`. Entre 600 y 1.000 palabras, y hasta 1.500 en las guías: mejor corto y denso que largo y repetido. La longitud la marca lo que hay que responder, nunca un número que alcanzar.

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
- Estructura de gancho, preguntas, final y envío, adaptada a un artículo (en redes va más apretada):
  1. Gancho: la primera frase de la introducción asombra, indigna o asusta con algo concreto y verdadero. Sin calentamiento. El `title` y la `description` no llevan gancho: dicen claro de qué va el artículo.
  2. Preguntas: salen del propio contenido, como las que se haría el lector, y se notan sobre todo en los títulos de sección. Nada de frases puente al final de cada sección para crear intriga, ni misterios anunciados que luego no se resuelven.
  3. Final: el cierre vuelve a la situación del principio con algo útil, no con un eslogan.
  4. Envío: al menos un dato, un error o un truco que den ganas de mandárselo a alguien.
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
5. Los enlaces internos: al menos 3 en el cuerpo. Cuéntalos con `grep -oE '\]\(/(jardin|arreglos|restauracion|negocio|mil-panes|herramientas)/' <archivo> | wc -l`.

## Búsqueda y enlaces

Cada artículo responde una búsqueda concreta que la gente escribe tal cual en Google, mejor que nadie.

### Antes de escribir un tema

- Busca en `content/` y en `content/herramientas/` si ya hay un artículo o una herramienta que responda lo mismo. Si lo hay, no se escribe uno nuevo: se amplía el existente con lo que falte (con `lastmod`), se marca el tema en `temas.md` con una nota y se avisa a Sergio.
- Cada idea se cuenta en un solo artículo; en los demás se enlaza.
- La línea `TikTok:` del tema no va en el artículo: al terminar, se le pasa a Sergio en una línea.
- Antes de escribir, consulta el autocompletado de Google con la frase principal (`https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=es&q=<frase>`) y apunta las sugerencias. Son las preguntas que se hace la gente.
- Un artículo por búsqueda distinta, nunca uno por variante de la misma («hojas amarillas en el poto» y «poto con hojas amarillas» son la misma).

### Título y primer párrafo

- `title`: la búsqueda con las palabras de la gente, al principio, y después lo que aporta Tito. Ej.: «La cisterna pierde agua sin tirar de la cadena: dónde mirar». El slug, la búsqueda sin palabras vacías.
- Primera frase: el gancho. Las dos siguientes: la respuesta directa en 40-60 palabras, que se entienda sin leer nada más, para que Google pueda mostrarla arriba de los resultados.

### Estructura

- Los `##` son preguntas que sugiere el autocompletado, con sus palabras, y cada uno se responde en su primera frase.
- Sin preguntas frecuentes con datos estructurados: Google ya no las muestra a webs como esta.

### Enlaces internos

- Al menos 3 enlaces en el cuerpo a otros artículos o herramientas, en la frase donde vienen a cuento. El texto del enlace dice a dónde lleva; nunca «aquí» ni «este artículo».
- Al publicar, edita uno o dos artículos antiguos de la misma sección para que enlacen al nuevo donde venga a cuento, sin añadir relleno.
- Si el tema del artículo tiene relación con alguna de las herramientas de `content/herramientas/` (calculadoras, diagnósticos, calendario, aviso de heladas…), el artículo incluye un enlace destacado a ella en los tres primeros párrafos, con una frase que diga qué resuelve.

## Afiliación

- Los enlaces de compra van con el shortcode `{{< afiliado url="…" texto="…" >}}` (con `tienda="…"` si no es Amazon), justo donde el artículo habla de ese producto. Como mucho, uno por producto y tres por artículo.
- El artículo muestra solo el aviso de afiliación arriba cuando usa el shortcode; no hace falta escribirlo.
- Solo productos que de verdad sirven para lo que explica el artículo. Nunca se dice que Tito lo ha usado si no consta en «Experiencias reales de Sergio».

## Mil Panes

`content/mil-panes/`: recetas de pan, pizza y cocina de Sergio, con paleta propia (`zona-panes`).

- Solo se escribe una receta cuando Sergio da la receta o la foto y su forma de hacerla. La tarea automática no escribe recetas ni toma temas de cocina.
- Lo que más importa en esta sección son sus errores: lo que salió mal se cuenta siempre, en una sección propia, sin disimularlo.
- Lo que pasa después de publicar (se puso duro al día siguiente, una prueba nueva) va al final en una caja `{{< actualizacion id="…" fecha="…" >}}` con su `##`, y se avisa arriba, tras la introducción, con `{{< aviso-actualizacion >}}` y un enlace a `#id`. Se pone `lastmod`.
- Si Sergio no dio los pesos, se dice en el artículo y las cantidades se basan en fuentes comprobadas. Cuando pase sus pesos, se corrigen y se pone `lastmod`.
- Front matter extra: `receta` con `raciones`, `total` (ISO 8601, como `PT6H`), `total_texto`, `horno`, `cantidades` (lista de `cantidad` e `ingrediente`), `palabras` (3 o 4 búsquedas de la receta) y `cocina` si no es española (`Italiana`, `Catalana`…). Los pasos van en `pasos`. Con `receta`, la página lleva datos estructurados de receta en vez de artículo, y `{{< pasos >}}` pinta la ficha de receta completa (datos, ingredientes, pasos y error típico): va justo después de la introducción.

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

La portada tiene que medir al menos 1200 px de ancho ya preparada, porque Google Discover descarta las imágenes más pequeñas. Si una foto de Sergio no llega, úsala dentro del texto con `foto`, no como portada, y díselo en una línea. Las de Pixabay se descargan siempre con `largeImageURL`.

Los artículos con portada de Sergio salen en el «Cuaderno de Tito» de la portada, con su foto. Los de Pixabay salen en «Guías», solo con el título.

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
- También ha tenido problemas con lavanda y romero en algunos puntos de la franja. Confirmado por foto: una de sus lavandas se quedó como una mata gris y seca en tierra pedregosa (`fotos/lavanda-seca.jpg`) y parecía muerta, pero la rescató pasándola a una maceta con gravilla y regándola poco. A finales de octubre de 2026 la volvió a pasar al suelo; a 2-nov va más o menos bien y le preocupan las heladas.
- Un vecino tiene a pocos metros una lavanda enorme y en flor, a pleno sol, en una esquina de pavimento con gravilla (`fotos/lavanda-vecino.jpg`). Es del vecino: nunca se presenta como de Sergio.
- Plantó en marzo tulipanes con bulbos comprados en Amazon. En abril florecieron (rojos, rosas y naranjas, confirmado por foto: `fotos/tulipan*.jpg`). Esperaba que taparan el suelo, pero al marchitarse solo quedaba alguna hoja. Los quitó para poner setos y piedra volcánica.
- Este verano tuvo cochinilla algodonosa en un sarmiento de su parra (`fotos/cochinilla-parra.jpg`) y encontró una larva blanca de escarabajo enroscada en C, del tamaño de una moneda de 1 € (`fotos/gusano-blanco-larva.jpg`). No consta qué especie era la larva ni qué hizo con ninguna de las dos.
- Hizo panecillos sin gluten con el mix Caputo Fioreglut, levadura Caputo, algo de leche en polvo y algo de psyllium para una masa muy húmeda, unas 5 horas de fermentación y horno fuerte, sin pesar las cantidades. Recién hechos quedaron muy crujientes; al día siguiente estaban duros (`fotos/panecillo-sin-gluten.jpg`, con el fondo retocado por IA: el pan es el suyo).
- Hizo dónuts sin gluten con el mix Caputo, fritos y con glaseado; no recuerda los demás ingredientes ni los pesos. Les da el sabor a dónut con vainilla y nuez moscada. Quedaron increíbles, pero los hizo muy gordos y tuvo que dorarlos mucho para que se hicieran por dentro (`fotos/donuts-sin-gluten.jpg`).
- Hizo un panettone de chocolate sin gluten (6-nov-2026) con Caputo Fioreglut, prefermento y amasadora con pala, con pesos apuntados (receta en `content/mil-panes/panettone-chocolate-sin-gluten.md`). No tenía molde de panettone y lo probó en un molde de tarta metálico de 20 cm, sin papel: salió ancho y bajo. Pasó la masa de la amasadora al molde sin tocarla más y tardó casi 4 horas en llegar al borde. Horneado 40 min, casi la mitad bajando de 170 a 150 °C porque se tostaba mucho; la superficie quedó muy oscura y la miga abierta y aireada (`fotos/panettone-sin-gluten-*.jpg`, fondo retocado por IA).
- Su madre (en la web, «la yaya Garlopa») hace panellets con patata cocida, harina de almendra y azúcar, rebozados en piñón o con almendra laminada, sin gluten. Solo usa piñón ibérico porque dice que con otro no están buenos. Acepta mejoras a su receta. No dio pesos. En la foto (`fotos/panellets-yaya.jpg`) los de almendra laminada tienen pocas láminas y alguna mancha muy tostada.
- Le regalaron un olivo de 60 a 80 cm en una maceta de 9 × 9 cm y dudó entre plantarlo en el suelo o pasarlo a una maceta grande.
- Ha querido envejecer una maceta de terracota para que pareciera antigua y blanquecina.
- En su dormitorio, la pared del cabecero está torcida y las esquinas no van a escuadra, lo que complica colocar papel pintado. Tenía una moldura blanca estrecha que se despegaba.
- Ha estudiado poner una tira LED de luz cálida en el perímetro del techo del dormitorio, de unos 15 m.
- Confirmado por foto: el dormitorio ya tiene papel pintado de ramas verdes sobre fondo beige y una tira LED cálida en el remate del techo de madera (`fotos/papel-pintado-dormitorio*.jpg`).
- Ha investigado estuco y microcemento para el baño.
- Trabaja a diario con programas de TPV para tiendas y ha visto fallar muchas impresoras de tickets, cajones, balanzas y datáfonos. Se puede contar así, en general, en los artículos de `negocio`; nunca se nombra la empresa, los clientes ni el programa.

Salvo su trabajo con TPV, de todo esto solo constan los problemas y lo que estudió, no el resultado final. No se cuenta como hecho algo que no consta, como «así quedó» o «lo instalé».

## Reglas que no se rompen

- No inventar experiencias personales de Tito Garlopa ("a mí me pasó", "en mi jardín"). Solo se usan las que Sergio haya contado.
- No inventar cifras, estudios ni precios. Cualquier dato concreto se comprueba antes con una búsqueda.
- En trabajos con electricidad, gas, productos químicos o alturas, avisar de los riesgos y de cuándo llamar a un profesional.
- Antes de publicar, `hugo --minify` debe terminar sin WARN ni ERROR.


## Tareas programadas

Las instrucciones completas de cada tarea están aquí. El prompt de la tarea solo dice cuál ejecutar y lleva las claves, que nunca se escriben en el repositorio.

### Martes y viernes

Cada ejecución hace un solo trabajo, según el día de la semana en España (`TZ=Europe/Madrid date +%u`: 2 es martes, 5 es viernes).

Siempre, antes del trabajo del día:

1. Lee este archivo entero.
2. Procesa las fotos nuevas de Google Drive como dice «Fotos».

Martes, mejorar una guía ya publicada:

1. Elige el artículo que lleve más tiempo sin revisar: el de `lastmod` más antiguo, o `date` si no tiene. No cuentan los de `mil-panes`.
2. Consulta el autocompletado de Google con su búsqueda principal y compara las sugerencias con sus `##`.
3. Mejóralo solo con cambios que se noten: una pregunta de la gente que no respondía, un dato comprobado que faltaba, una foto de Sergio, el enlace a su herramienta, ideas repetidas o relleno que sobran.
4. Si otro artículo responde casi la misma búsqueda, se funden: queda el que tenga la búsqueda más amplia, se le añade lo que solo estaba en el otro, se borra el otro y su ruta se pone en `aliases` del que queda, para que la dirección antigua redirija. Ninguna búsqueda de las que respondían se pierde. Corrige los enlaces internos que apuntaban al borrado.
5. Pon `lastmod` con la fecha de hoy y pasa la «Revisión, siempre».
6. Si el artículo no admite ninguna mejora de verdad, déjalo sin tocar, sin `lastmod`, y prueba con el siguiente más antiguo, hasta tres. Si ninguno la admite, no publiques nada y díselo a Sergio.

Viernes, publicar el primer tema sin marcar de `temas.md`:

1. Sigue «Antes de escribir un tema». Si ya lo responde un artículo o una herramienta, o el tema empieza por «Ampliar», se amplía lo que hay en vez de escribir uno nuevo.
2. Apunta las 4 a 6 ideas, decide dónde va cada una y elige la forma que pide el tema.
3. Escribe el artículo con la fecha de hoy, con foto de Sergio si alguna encaja y, si no, con portada de Pixabay.
4. Pasa la «Revisión, siempre» hasta que el grep de expresiones prohibidas no devuelva nada.
5. Marca el tema como hecho. Si quedan menos de 6 sin marcar, añade 6 como pide la cabecera de `temas.md`: secciones repartidas, búsquedas reales del autocompletado, idea de vídeo, los de temporada delante y ninguno que se solape con lo publicado.

Siempre, al terminar:

1. `hugo --minify` sin WARN ni ERROR. Comprueba con grep que ninguna clave aparece en ningún archivo.
2. Commit en `main` y push. Mensaje: «Guía: <título>» los martes y «Artículo: <título>» los viernes.
3. Un mensaje corto a Sergio: qué se publicó o se mejoró, con su dirección y, los martes, qué cambió en una línea; la idea de vídeo del tema, los viernes; las fotos descartadas y el motivo; y lo que solo él pueda hacer, con el paso exacto.

Si algo impide publicar (sin acceso al repositorio, un fallo de compilación que no se pueda arreglar), no se publica nada y se le explica el motivo en un mensaje corto.

### Día 1 de cada mes

Además de lo que pide el prompt de la tarea, el resumen incluye lo de «Resumen mensual».

## Resumen mensual

Cuando se prepare el resumen del día 1, además de lo que ya incluye:

- Lista los artículos publicados hace más de 7 días y recuérdale a Sergio que compruebe en Search Console (Inspección de URLs) si están indexados y que pida la indexación de los que no lo estén, unos pocos al día.
- Si la tarea tiene la clave de la API de Bing Webmaster, consulta qué artículos ha indexado Bing y apúntalo. La clave nunca se escribe en el repositorio.
