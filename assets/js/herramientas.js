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
        { id: "rolloLargo", label: "Largo del rollo", unidad: "m", valor: 10.05 }
      ],
      calcular: v => {
        const tira = v.alto + v.rapport / 100 + .1;
        const porRollo = Math.floor(v.rolloLargo / tira);
        const tiras = Math.ceil(v.ancho / (v.rolloAncho / 100));
        if (!v.alto || !porRollo || !isFinite(tiras) || !tiras) return null;
        return [
          ["Rollos", Math.ceil(tiras / porRollo)],
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

  for (const bloque of document.querySelectorAll(".este-mes")) {
    const meses = JSON.parse(bloque.dataset.meses);
    let i = new Date().getMonth();
    const titulo = bloque.querySelector(".este-mes-titulo");
    const listas = bloque.querySelectorAll("ul");
    const pintar = () => {
      [...titulo.childNodes].find(n => n.nodeType === 3).textContent = meses[i].mes;
      [meses[i].jardin, meses[i].casa].forEach((tareas, k) => listas[k].replaceChildren(...tareas.map(t => crear("li", "", t))));
    };
    if (bloque.closest("[data-herramienta]")) {
      const paso = d => crear("button", "atras", d < 0 ? "←" : "→");
      const antes = paso(-1), despues = paso(1);
      antes.setAttribute("aria-label", "Mes anterior");
      despues.setAttribute("aria-label", "Mes siguiente");
      antes.addEventListener("click", () => { i = (i + 11) % 12; pintar(); });
      despues.addEventListener("click", () => { i = (i + 1) % 12; pintar(); });
      titulo.prepend(antes);
      titulo.append(despues);
      titulo.classList.add("con-flechas");
    }
    pintar();
  }

  for (const caja of document.querySelectorAll(".herramienta")) {
    const datos = caja.querySelector('script[type="application/json"]');
    if (datos) diagnosticar(caja, JSON.parse(datos.textContent));
  }

  for (const caja of document.querySelectorAll("[data-herramienta]")) {
    const def = calculadoras[caja.dataset.herramienta];
    if (def) montar(caja, caja.dataset.herramienta, def);
  }
})();
