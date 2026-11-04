(() => {
  const num = v => Number(String(v).replace(",", ".")) || 0;
  const dec = (n, d = 1) => n.toLocaleString("es-ES", { maximumFractionDigits: d });
  const eur = n => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  const crear = (etiqueta, clase, texto) => {
    const e = document.createElement(etiqueta);
    if (clase) e.className = clase;
    if (texto !== undefined) e.textContent = texto;
    return e;
  };

  const monedas = [500, 200, 100, 50, 20, 10, 5, 2, 1, .5, .2, .1, .05, .02, .01];

  const calculadoras = {
    papel: {
      campos: [
        { id: "ancho", label: "Ancho de la pared", unidad: "m", valor: 3 },
        { id: "alto", label: "Alto de la pared", unidad: "m", valor: 2.5 },
        { id: "rapport", label: "Casamiento del dibujo", unidad: "cm", valor: 0 },
        { id: "rolloAncho", label: "Ancho del rollo", unidad: "cm", valor: 53 },
        { id: "rolloLargo", label: "Largo del rollo", unidad: "m", valor: 10.05 },
        { id: "precio", label: "Precio del rollo (opcional)", unidad: "€", valor: 0 }
      ],
      calcular: v => {
        const tira = v.alto + v.rapport / 100 + .1;
        const porRollo = Math.floor(v.rolloLargo / tira);
        const tiras = Math.ceil(v.ancho / (v.rolloAncho / 100));
        if (!v.alto || !porRollo || !isFinite(tiras) || !tiras) return null;
        const rollos = Math.ceil(tiras / porRollo);
        return [
          ["Rollos", rollos],
          ...(v.precio > 0 ? [["Coste del papel", eur(rollos * v.precio)]] : []),
          ["Tiras", tiras],
          ["Tiras por rollo", porRollo],
          ["Largo de cada tira", `${dec(tira, 2)} m`]
        ];
      }
    },
    riego: {
      campos: [
        { id: "plantas", label: "Plantas", valor: 10 },
        { id: "goteros", label: "Goteros por planta", valor: 2 },
        { id: "caudal", label: "Caudal del gotero", opciones: [[2, "2 l/h"], [4, "4 l/h"], [8, "8 l/h"]], valor: 2 },
        { id: "minutos", label: "Duración del riego", unidad: "min", valor: 30 },
        { id: "riegos", label: "Riegos por semana", valor: 3 }
      ],
      calcular: v => {
        const porPlanta = v.goteros * v.caudal * v.minutos / 60;
        if (!porPlanta || !v.plantas) return null;
        return [
          ["Litros por planta y riego", dec(porPlanta)],
          ["Litros por riego", dec(porPlanta * v.plantas)],
          ["Litros a la semana", dec(porPlanta * v.plantas * v.riegos)],
          ["Caudal de la instalación", `${dec(v.plantas * v.goteros * v.caudal)} l/h`]
        ];
      }
    },
    led: {
      campos: [
        { id: "metros", label: "Largo de la tira", unidad: "m", valor: 5 },
        { id: "potencia", label: "Potencia por metro", unidad: "W/m", valor: 9.6 },
        { id: "tension", label: "Tensión de la tira", opciones: [[12, "12 V"], [24, "24 V"]], valor: 24 }
      ],
      calcular: v => {
        const consumo = v.metros * v.potencia;
        if (!consumo || !v.tension) return null;
        return [
          ["Fuente de al menos", `${dec(consumo * 1.2, 0)} W`],
          ["Consumo de la tira", `${dec(consumo)} W`],
          ["Corriente de la fuente", `${dec(consumo * 1.2 / v.tension)} A`]
        ];
      }
    },
    pintura: {
      campos: [
        { id: "superficie", label: "Superficie", unidad: "m²", valor: 12 },
        { id: "manos", label: "Manos", valor: 2 },
        { id: "rendimiento", label: "Rendimiento del bote", unidad: "m²/l", valor: 10 }
      ],
      calcular: v => {
        if (!v.superficie || !v.rendimiento) return null;
        const mano = v.superficie / v.rendimiento;
        return [
          ["Litros", dec(mano * Math.max(1, v.manos))],
          ["Litros por mano", dec(mano)]
        ];
      }
    },
    arqueo: {
      campos: [
        { id: "fondo", label: "Importe inicial", unidad: "€", valor: 0, grupo: "Apertura" },
        { id: "ventasEf", label: "Ventas en efectivo", unidad: "€", valor: 0, grupo: "Según el TPV" },
        { id: "ventasTj", label: "Ventas con tarjeta", unidad: "€", valor: 0 },
        { id: "salidas", label: "Pagos y retiradas de caja", unidad: "€", valor: 0 },
        { id: "efectivo", label: "Efectivo contado", unidad: "€", valor: 0, grupo: "Contado" },
        { id: "tarjeta", label: "Total del datáfono", unidad: "€", valor: 0 },
        { id: "dejar", label: "Fondo que dejas", unidad: "€", valor: 0, grupo: "Cierre" },
        ...monedas.map(m => ({ id: `m${m}`, label: eur(m).replace(",00", ""), unidad: "uds.", valor: 0, plegado: "Contar billetes y monedas" }))
      ],
      cambio: (v, controles) => {
        const suma = monedas.reduce((s, m) => s + m * v[`m${m}`], 0);
        controles.efectivo.readOnly = suma > 0;
        if (suma > 0) {
          controles.efectivo.value = dec(suma, 2);
          v.efectivo = suma;
        }
      },
      calcular: v => {
        const r = n => Math.round(n * 100) / 100;
        const esperado = v.fondo + v.ventasEf - v.salidas;
        const difEf = r(v.efectivo - esperado);
        const difTj = r(v.tarjeta - v.ventasTj);
        const total = r(difEf + difTj);
        const texto = d => d === 0 ? "Cuadra" : `${d > 0 ? "Sobran" : "Faltan"} ${eur(Math.abs(d))}`;
        const filas = [
          !v.efectivo && !v.tarjeta ? ["Pon lo contado", ""]
            : total === 0 && difEf !== 0 ? ["Cuadra en total", ""]
            : total === 0 ? ["La caja cuadra", "✓"]
            : [total > 0 ? "Sobran" : "Faltan", eur(Math.abs(total))],
          ["Efectivo esperado", eur(esperado)],
          ["Efectivo", texto(difEf)]
        ];
        if (v.ventasTj || v.tarjeta) filas.push(["Tarjeta", texto(difTj)]);
        if (total === 0 && difEf !== 0) filas.push(["Cobro mal marcado", eur(Math.abs(difEf))]);
        filas.push(["A retirar de la caja", eur(Math.max(0, v.efectivo - v.dejar))]);
        if (v.dejar > v.efectivo) filas.push(["No llega para el fondo", eur(v.dejar - v.efectivo)]);
        return filas;
      }
    }
  };

  const montar = (caja, nombre, def) => {
    const clave = `herramienta:${nombre}`;
    let guardado = {};
    try { guardado = JSON.parse(localStorage.getItem(clave)) || {}; } catch {}
    const form = crear("form", "campos");
    const controles = {};
    const plegables = {};
    for (const c of def.campos) {
      let destino = form;
      if (c.plegado) {
        if (!plegables[c.plegado]) {
          const d = crear("details", "plegable");
          d.append(crear("summary", "", c.plegado));
          form.append(d);
          plegables[c.plegado] = d;
        }
        destino = plegables[c.plegado];
      }
      if (c.grupo) destino.append(crear("p", "grupo", c.grupo));
      const campo = crear("label", "campo");
      campo.append(crear("span", "", c.label));
      let control;
      if (c.opciones) {
        control = crear("select");
        for (const [valor, texto] of c.opciones) control.append(new Option(texto, valor));
      } else {
        control = crear("input");
        control.inputMode = "decimal";
        control.autocomplete = "off";
      }
      control.value = String(guardado[c.id] ?? c.valor).replace(".", ",");
      controles[c.id] = control;
      const entrada = crear("span", "entrada");
      entrada.append(control);
      entrada.append(crear("span", "unidad", c.unidad || ""));
      campo.append(entrada);
      destino.append(campo);
    }
    const resultado = crear("dl", "resultado");
    resultado.setAttribute("aria-live", "polite");
    const calcular = () => {
      const v = {};
      for (const id in controles) v[id] = num(controles[id].value);
      def.cambio?.(v, controles);
      const filas = def.calcular(v);
      resultado.replaceChildren();
      if (!filas) { resultado.append(crear("dt", "", "Revisa los datos")); return; }
      for (const [k, val] of filas) {
        const fila = crear("div");
        fila.append(crear("dt", "", k), crear("dd", "", val));
        resultado.append(fila);
      }
      try { localStorage.setItem(clave, JSON.stringify(Object.fromEntries(Object.entries(controles).map(([k, c]) => [k, c.value])))); } catch {}
    };
    form.addEventListener("input", calcular);
    form.addEventListener("submit", e => e.preventDefault());
    caja.append(form, resultado);
    calcular();
  };

  const diagnosticar = (caja, arbol) => {
    const camino = [];
    const boton = (texto, clase, accion) => {
      const b = crear("button", clase, texto);
      b.type = "button";
      b.addEventListener("click", accion);
      return b;
    };
    const pintar = id => {
      const n = arbol.nodos[id];
      const hijos = [];
      if (n.pregunta) {
        const respuestas = crear("div", "respuestas");
        respuestas.append(
          boton("Sí", "boton", () => { camino.push(id); pintar(n.si); }),
          boton("No", "boton", () => { camino.push(id); pintar(n.no); })
        );
        hijos.push(crear("p", "grupo", `Pregunta ${camino.length + 1}`), crear("h2", "pregunta", n.pregunta), respuestas);
      } else {
        hijos.push(crear("p", "grupo", "Lo más probable"), crear("h2", "pregunta", n.resultado), crear("p", "", n.texto));
        if (n.enlace) {
          const a = crear("a", "usa-herramienta", `${n.enlace_texto} →`);
          a.href = n.enlace;
          hijos.push(a);
        }
      }
      if (camino.length) {
        const pie = crear("div", "volver-diag");
        pie.append(boton("← Atrás", "atras", () => pintar(camino.pop())));
        if (!n.pregunta) pie.append(boton("Empezar de nuevo", "atras", () => { camino.length = 0; pintar(arbol.inicio); }));
        hijos.push(pie);
      }
      caja.replaceChildren(...hijos);
    };
    pintar(arbol.inicio);
  };

  for (const caja of document.querySelectorAll(".herramienta")) {
    const datos = caja.querySelector('script[type="application/json"]');
    if (datos && !caja.dataset.herramienta) diagnosticar(caja, JSON.parse(datos.textContent));
  }

  const niveles = [
    { hasta: -6, nombre: "Helada fuerte", consejo: "Cubre todo lo sensible con manta térmica, mete dentro las macetas que puedas y deja un grifo goteando si las tuberías van por fuera." },
    { hasta: -2, nombre: "Helada", consejo: "Cubre las plantas jóvenes y las de maceta, y vacía el riego por goteo y el grifo de fuera." },
    { hasta: 0, nombre: "Helada débil", consejo: "Junta las macetas contra una pared de la casa y cubre lo recién plantado." },
    { hasta: 3, nombre: "Puede helar a ras de suelo", consejo: "Con cielo despejado y sin viento, el césped y lo recién plantado pueden amanecer con escarcha." },
    { hasta: Infinity, nombre: "Sin helada", consejo: "" }
  ];
  const nivel = t => niveles.find(n => t <= n.hasta);

  const heladas = caja => {
    if (!caja.dataset.clave) {
      caja.append(crear("p", "", "El aviso de heladas no está disponible ahora mismo."));
      return;
    }
    const clave = "herramienta:heladas:sitio";
    const form = crear("form", "buscar-sitio");
    const entrada = crear("input");
    entrada.placeholder = "Tu pueblo o ciudad";
    entrada.autocomplete = "address-level2";
    entrada.enterKeyHint = "search";
    entrada.setAttribute("aria-label", "Pueblo o ciudad");
    form.append(entrada, crear("button", "boton", "Ver"));
    const aqui = crear("button", "atras", "Usar mi ubicación");
    aqui.type = "button";
    const salida = crear("div", "prevision");
    salida.setAttribute("aria-live", "polite");
    const fuente = crear("p", "fuente");
    const enlace = (texto, url) => { const a = crear("a", "", texto); a.href = url; a.rel = "noopener"; return a; };
    fuente.append("Previsión de ", enlace("WeatherAPI.com", "https://www.weatherapi.com/"), " · Pueblos de ", enlace("OpenStreetMap", "https://www.openstreetmap.org/copyright"));
    caja.append(form, aqui, salida, fuente);
    const aviso = texto => salida.replaceChildren(crear("p", "", texto));

    const dia = f => new Date(`${f}T12:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric" });
    const prevision = async sitio => {
      aviso("Buscando la previsión…");
      try {
        const r = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${caja.dataset.clave}&q=${sitio.lat},${sitio.lon}&days=3&lang=es&aqi=no&alerts=no`);
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();
        try { localStorage.setItem(clave, JSON.stringify(sitio)); } catch {}
        const dias = d.forecast.forecastday.map(f => {
          const min = Math.round(f.day.mintemp_c);
          const n = nivel(min);
          const fila = crear("div", `dia${n.consejo ? " frio" : ""}`);
          const cab = crear("div", "dia-cab");
          cab.append(crear("span", "dia-nombre", dia(f.date)), crear("span", "dia-temp", `${min}° / ${Math.round(f.day.maxtemp_c)}°`));
          fila.append(cab, crear("span", "etiqueta", n.nombre));
          if (n.consejo) fila.append(crear("p", "", n.consejo));
          return fila;
        });
        salida.replaceChildren(crear("p", "grupo", sitio.nombre), ...dias);
      } catch {
        aviso("No se ha podido cargar la previsión. Prueba otra vez en un rato.");
      }
    };

    const lugar = r => {
      const a = r.address || {};
      const nombre = r.name || a.village || a.town || a.city || a.municipality || r.display_name.split(",")[0];
      const zona = a.province || a.state || a.county || a.country;
      return { nombre: [nombre, zona].filter((x, i, l) => x && l.indexOf(x) === i).join(", "), lat: (+r.lat).toFixed(3), lon: (+r.lon).toFixed(3) };
    };
    const geo = async params => {
      const r = await fetch(`https://nominatim.openstreetmap.org/${params}&format=jsonv2&addressdetails=1&accept-language=es`);
      if (!r.ok) throw new Error(r.status);
      return r.json();
    };
    const buscar = async texto => {
      aviso("Buscando el pueblo…");
      try {
        let lista = await geo(`search?q=${encodeURIComponent(texto)}&countrycodes=es&limit=6`);
        if (!lista.length) lista = await geo(`search?q=${encodeURIComponent(texto)}&limit=6`);
        const sitios = lista.map(lugar).filter((x, i, l) => l.findIndex(y => y.nombre === x.nombre) === i);
        if (!sitios.length) return aviso("No he encontrado ese pueblo. Prueba a añadir la provincia, como «Cañada del Hoyo, Cuenca».");
        if (sitios.length === 1) return prevision(sitios[0]);
        const opciones = crear("div", "opciones");
        for (const sitio of sitios) {
          const b = crear("button", "opcion", sitio.nombre);
          b.type = "button";
          b.addEventListener("click", () => { entrada.value = sitio.nombre; prevision(sitio); });
          opciones.append(b);
        }
        salida.replaceChildren(crear("p", "grupo", "¿Cuál de estos?"), opciones);
      } catch {
        aviso("No se ha podido buscar el pueblo. Prueba otra vez en un rato.");
      }
    };

    form.addEventListener("submit", e => {
      e.preventDefault();
      entrada.blur();
      if (entrada.value.trim()) buscar(entrada.value.trim());
    });
    aqui.addEventListener("click", () => {
      if (!navigator.geolocation) return aviso("Tu navegador no permite usar la ubicación. Escribe tu pueblo.");
      aviso("Buscando tu ubicación…");
      navigator.geolocation.getCurrentPosition(
        async p => {
          const sitio = { nombre: "Tu ubicación", lat: p.coords.latitude.toFixed(3), lon: p.coords.longitude.toFixed(3) };
          try { Object.assign(sitio, { nombre: lugar(await geo(`reverse?lat=${sitio.lat}&lon=${sitio.lon}&zoom=14`)).nombre }); } catch {}
          entrada.value = sitio.nombre;
          prevision(sitio);
        },
        e => aviso(e.code === 1
          ? "No has dado permiso para usar tu ubicación. En el iPhone se activa en Ajustes › Privacidad › Localización › Safari. Mientras, escribe tu pueblo."
          : "No se ha podido obtener tu ubicación. Escribe tu pueblo."),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
      );
    });
    let previo = null;
    try { previo = JSON.parse(localStorage.getItem(clave)); } catch {}
    if (previo?.lat) { entrada.value = previo.nombre; prevision(previo); }
  };

  const balanza = (caja, datos) => {
    const sellos = { arreglar: "ARRÉGLALO", tirar: "TÍRALO", probar: "PRUEBA ANTES" };
    const banco = crear("div", "banco");
    banco.setAttribute("aria-hidden", "true");
    const cruz = crear("div", "cruz");
    const plato = (lado, nombre) => {
      const d = crear("div", "plato p-" + lado);
      const bandeja = crear("div", "bandeja");
      bandeja.append(crear("div", "pesas"));
      d.append(crear("div", "hilos"), bandeja, crear("div", "nombre", nombre));
      return d;
    };
    const platos = { arreglar: plato("arreglar", "ARRÉGLALO"), tirar: plato("tirar", "TÍRALO") };
    banco.append(crear("div", "pie-b"), crear("div", "poste"), cruz, crear("div", "eje"), platos.arreglar, platos.tirar);
    const lectura = crear("p", "lectura");
    lectura.setAttribute("aria-live", "polite");
    const pasos = crear("div");
    const resultado = crear("div");
    const vista = crear("div", "vista");
    vista.append(banco, lectura);
    caja.append(vista, pasos, resultado);

    let estado = {};
    const pesas = () => {
      const l = [];
      if (estado.averia) l.push({ v: estado.averia.peso, txt: estado.averia.pesa });
      for (const q of datos.preguntas) { const o = estado[q.id]; if (o?.peso) l.push({ v: o.peso, txt: o.pesa }); }
      return l;
    };

    const inclina = () => {
      const l = pesas();
      const s = l.reduce((a, p) => a + p.v, 0);
      const ang = Math.max(-16, Math.min(16, -s * 4));
      cruz.style.setProperty("--a", ang + "deg");
      const L = cruz.offsetWidth / 2 - 6, r = ang * Math.PI / 180;
      const dx = Math.cos(r) * L, dy = Math.sin(r) * L;
      for (const [lado, signo] of [["arreglar", -1], ["tirar", 1]]) {
        const p = platos[lado];
        p.style.left = banco.offsetWidth / 2 + "px";
        p.style.transform = `translate(${signo * dx}px, ${signo * dy}px)`;
        const caja = p.querySelector(".pesas");
        const mias = l.filter(x => (lado === "arreglar") === (x.v > 0)).map(x => x.txt);
        [...caja.children].forEach(c => { if (!mias.includes(c.textContent)) c.remove(); });
        const hay = [...caja.children].map(c => c.textContent);
        mias.filter(t => !hay.includes(t)).forEach(t => caja.append(crear("span", "pesa", t)));
      }
      lectura.textContent = !l.length ? "" : s >= 2 ? "Se inclina hacia arreglarlo." : s <= -2 ? "Se inclina hacia tirarlo." : "Está en el aire.";
      return s;
    };

    const opcion = (texto, activo, al) => {
      const b = crear("button", "", texto);
      b.type = "button";
      b.setAttribute("aria-pressed", !!activo);
      b.addEventListener("click", al);
      return b;
    };
    const paso = (n, titulo, botones, lista) => {
      const d = crear("section", "paso");
      const h = crear("h2");
      h.append(crear("span", "", n), titulo);
      const ops = crear("div", "ops" + (lista ? " lista" : ""));
      ops.append(...botones);
      d.append(h, ops);
      return d;
    };

    const veredicto = s => {
      const { objeto: o, averia: a } = estado;
      const tipo = s >= 2 ? "arreglar" : s <= -2 ? "tirar" : "probar";
      const frases = datos.frases[tipo];
      const art = crear("article", "veredicto v-" + tipo);
      const tito = crear("p", "tito", `«${frases[(o.id.length + a.id.length) % frases.length]}»`);
      tito.append(crear("span", "", " — Tito"));
      const cifras = crear("div", "cifras");
      for (const [k, v] of [["Dificultad", a.dificultad], ["Tiempo", a.tiempo], ["Coste", a.coste]]) {
        const d = crear("div");
        d.append(crear("small", "", k), crear("b", "", v));
        cifras.append(d);
      }
      art.append(crear("div", "sello", sellos[tipo]), tito, cifras, crear("h3", "", "Lo más probable"), crear("p", "", a.causa), crear("h3", "", "Qué hacer"), crear("p", "", a.hacer));
      if (estado.manos.peso < 0 && tipo !== "tirar") art.append(crear("p", "", "Si no te ves con ello, este arreglo lo hace cualquier manitas en un rato y sigue saliendo más barato que comprar otro."));
      const aviso = [o.electro ? "Desenchúfalo siempre antes de abrir nada." : "", a.aviso || ""].filter(Boolean).join(" ");
      if (aviso) art.append(crear("p", "aviso-b", aviso));
      const enlaces = crear("div", "enlaces");
      if (a.articulo) { const e = crear("a", "", "Cómo hacerlo paso a paso →"); e.href = a.articulo; enlaces.append(e); }
      if (a.repuesto) { const e = crear("a", "", "Ver el repuesto →"); e.href = a.repuesto; e.rel = "sponsored nofollow noopener"; e.target = "_blank"; enlaces.append(e); }
      if (enlaces.children.length) art.append(enlaces);
      const otra = crear("button", "atras", "← Probar con otra cosa");
      otra.type = "button";
      otra.addEventListener("click", () => { estado = {}; pinta(); caja.scrollIntoView({ behavior: "smooth" }); });
      art.append(otra);
      resultado.replaceChildren(art);
      art.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const pinta = () => {
      const s = inclina();
      pasos.replaceChildren();
      resultado.replaceChildren();
      pasos.append(paso(1, "¿Qué se ha roto?", datos.objetos.map(o => opcion(o.nombre, estado.objeto === o, () => { estado = { objeto: o }; pinta(); }))));
      if (!estado.objeto) return;
      pasos.append(paso(2, "¿Qué le pasa?", estado.objeto.averias.map(a => opcion(a.nombre, estado.averia === a, () => { estado = { objeto: estado.objeto, averia: a }; pinta(); })), true));
      if (!estado.averia) return;
      let n = 3;
      for (const q of datos.preguntas) {
        pasos.append(paso(n++, q.texto, q.opciones.map(o => opcion(o.texto, estado[q.id] === o, () => { estado[q.id] = o; pinta(); }))));
        if (!estado[q.id]) { pasos.lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" }); return; }
      }
      veredicto(s);
    };
    new ResizeObserver(() => inclina()).observe(banco);
    pinta();
  };

  const foto = caja => {
    const avisos = {
      limite: "Ya has subido 5 fotos hoy. Vuelve mañana o prueba con las preguntas de abajo.",
      agotado: "Tito está desbordado de fotos por hoy. Vuelve mañana o prueba con las preguntas de abajo.",
      foto: "No he podido leer la foto. Prueba con otra."
    };
    const reducir = async archivo => {
      const img = await createImageBitmap(archivo);
      const escala = Math.min(1, 1024 / Math.max(img.width, img.height));
      const lienzo = crear("canvas");
      lienzo.width = Math.round(img.width * escala);
      lienzo.height = Math.round(img.height * escala);
      lienzo.getContext("2d").drawImage(img, 0, 0, lienzo.width, lienzo.height);
      return lienzo.toDataURL("image/jpeg", .8).split(",")[1];
    };
    const form = crear("form", "campos");
    const archivo = crear("input");
    archivo.type = "file";
    archivo.accept = "image/*";
    archivo.required = true;
    const nota = crear("input");
    nota.placeholder = "Qué planta es o qué le notas (opcional)";
    nota.maxLength = 300;
    const enviar = crear("button", "boton", "Que la mire Tito");
    const salida = crear("div");
    salida.setAttribute("aria-live", "polite");
    form.append(crear("p", "grupo", "Con una foto"), crear("h2", "pregunta", "Enséñale tu planta a Tito"), archivo, nota, enviar,
      crear("p", "nota-ia", "La foto la analiza la IA de Google (Gemini) y no se guarda en esta web. Puede equivocarse: tómalo como una pista."));
    form.addEventListener("submit", async e => {
      e.preventDefault();
      enviar.disabled = true;
      salida.replaceChildren(crear("p", "", "Tito está mirando la foto…"));
      try {
        const r = await fetch(caja.dataset.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ foto: await reducir(archivo.files[0]), nota: nota.value })
        });
        const d = await r.json();
        if (d.error) throw d.error;
        const hijos = [crear("p", "grupo", "Lo que ve Tito"), crear("h2", "pregunta", d.problema)];
        if (d.que_hacer) hijos.push(crear("p", "", d.que_hacer));
        if (d.enlace) {
          const a = crear("a", "usa-herramienta", `${d.enlace.titulo} →`);
          a.href = d.enlace.url;
          hijos.push(a);
        }
        salida.replaceChildren(...hijos);
      } catch (err) {
        salida.replaceChildren(crear("p", "", avisos[err] || "No ha funcionado. Prueba otra vez en un rato o usa las preguntas de abajo."));
      }
      enviar.disabled = false;
    });
    caja.append(form, salida);
  };

  for (const caja of document.querySelectorAll('[data-herramienta="foto"]')) foto(caja);

  for (const caja of document.querySelectorAll('[data-herramienta="balanza"]')) {
    const datos = caja.querySelector('script[type="application/json"]');
    if (datos) balanza(caja, JSON.parse(datos.textContent));
  }

  for (const caja of document.querySelectorAll('[data-herramienta="heladas"]')) heladas(caja);

  for (const caja of document.querySelectorAll("[data-herramienta]")) {
    const def = calculadoras[caja.dataset.herramienta];
    if (def) montar(caja, caja.dataset.herramienta, def);
  }
})();
