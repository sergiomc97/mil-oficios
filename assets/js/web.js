(() => {
  const ficha = ruta => document.querySelector(`a.baldosa[href="${ruta}"], a.destacado[href="${ruta}"]`);
  addEventListener("pageswap", e => {
    const destino = e.viewTransition && e.activation?.entry?.url;
    const enlace = destino && ficha(new URL(destino).pathname);
    if (enlace) enlace.style.viewTransitionName = "ficha";
  });
  addEventListener("pagereveal", e => {
    const origen = e.viewTransition && navigation.activation?.from?.url;
    const enlace = origen && ficha(new URL(origen).pathname);
    if (!enlace) return;
    enlace.style.viewTransitionName = "ficha";
    e.viewTransition.finished.finally(() => { enlace.style.viewTransitionName = ""; });
  });

  addEventListener("DOMContentLoaded", () => {
    const buscador = document.querySelector(".buscador");
    if (buscador) {
      const entrada = buscador.querySelector("input");
      const lista = buscador.querySelector(".buscador-res");
      const sugerencias = buscador.querySelector(".buscador-sugerencias");
      let pagefind, apunte;
      const buscar = async () => {
        clearTimeout(apunte);
        const q = entrada.value.trim();
        sugerencias.hidden = !!q;
        if (!q) return lista.replaceChildren();
        pagefind ||= await import("/pagefind/pagefind.js");
        const r = await pagefind.debouncedSearch(q);
        if (!r) return;
        const datos = await Promise.all(r.results.slice(0, 10).map(x => x.data()));
        if (!datos.length) {
          const li = document.createElement("li");
          li.className = "sin-res";
          li.textContent = `No hay nada sobre «${q}» todavía. Me lo apunto para escribir sobre ello.`;
          const todas = document.createElement("a");
          todas.href = "/herramientas/";
          todas.textContent = "Mira todas las herramientas →";
          li.append(document.createElement("br"), todas);
          if (buscador.dataset.tito && q.length > 2) apunte = setTimeout(() => fetch(buscador.dataset.tito, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo: "busqueda", q }), keepalive: true }).catch(() => {}), 2000);
          return lista.replaceChildren(li);
        }
        lista.replaceChildren(...datos.map(d => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.className = `res sec-${d.meta.color}`;
          a.href = d.url;
          const tipo = document.createElement("span");
          tipo.className = "etiqueta";
          tipo.textContent = d.meta.tipo;
          const titulo = document.createElement("strong");
          titulo.textContent = d.meta.title;
          const trozo = document.createElement("p");
          trozo.innerHTML = d.excerpt;
          a.append(tipo, titulo, trozo);
          li.append(a);
          return li;
        }));
      };
      entrada.addEventListener("input", buscar);
      sugerencias.addEventListener("click", e => {
        if (e.target.matches("button")) { entrada.value = e.target.textContent; buscar(); }
      });
      document.querySelector("[data-buscar]")?.addEventListener("click", () => { buscador.showModal(); entrada.focus(); });
      buscador.querySelector("[data-cerrar]").addEventListener("click", () => buscador.close());
      buscador.addEventListener("click", e => { if (e.target === buscador) buscador.close(); });
    }

    const guardar = (clave, valor) => { try { localStorage.setItem(clave, JSON.stringify(valor)); } catch {} };
    const leer = clave => { try { return JSON.parse(localStorage.getItem(clave)) || []; } catch { return []; } };

    for (const bloque of document.querySelectorAll(".este-mes")) {
      const meses = JSON.parse(bloque.dataset.meses);
      let i = new Date().getMonth();
      const titulo = bloque.querySelector(".este-mes-titulo");
      const listas = bloque.querySelectorAll("ul");
      const pintar = () => {
        [...titulo.childNodes].find(n => n.nodeType === 3).textContent = meses[i].mes;
        [meses[i].jardin, meses[i].casa].forEach((tareas, k) => listas[k].replaceChildren(...tareas.map(t => Object.assign(document.createElement("li"), { textContent: t }))));
      };
      if (bloque.closest("[data-herramienta]")) {
        const paso = d => Object.assign(document.createElement("button"), { className: "atras", textContent: d < 0 ? "←" : "→" });
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

    const lista = document.querySelector(".pasos");
    if (lista) {
      const clave = "pasos:" + location.pathname;
      const pasos = [...lista.children];
      const contador = document.createElement("p");
      contador.className = "contador";
      contador.innerHTML = '<span aria-live="polite"></span><button type="button">Desmarcar todo</button>';
      lista.before(contador);
      lista.classList.add("marcables");
      let hechos = leer(clave);
      const pintar = () => {
        pasos.forEach((li, i) => {
          li.classList.toggle("hecho", hechos.includes(i));
          li.setAttribute("aria-pressed", hechos.includes(i));
        });
        contador.firstChild.textContent = `${hechos.length} de ${pasos.length} pasos hechos`;
        contador.lastChild.hidden = !hechos.length;
      };
      const cambiar = nuevos => { hechos = nuevos; guardar(clave, hechos); pintar(); };
      pasos.forEach((li, i) => {
        li.tabIndex = 0;
        li.setAttribute("role", "button");
        const alternar = () => cambiar(hechos.includes(i) ? hechos.filter(n => n !== i) : [...hechos, i]);
        li.addEventListener("click", alternar);
        li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternar(); } });
      });
      contador.lastChild.addEventListener("click", () => cambiar([]));
      pintar();
    }

    const barra = document.querySelector(".barra");
    if (barra) {
      const articulo = document.querySelector(".articulo");
      new IntersectionObserver(([e]) => barra.classList.toggle("visible", !e.isIntersecting && e.boundingClientRect.top < 0))
        .observe(articulo.querySelector("h1"));
      let pendiente = false;
      const medir = () => {
        const r = articulo.getBoundingClientRect();
        const avance = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
        barra.style.setProperty("--avance", `${(avance * 100).toFixed(1)}%`);
        pendiente = false;
      };
      addEventListener("scroll", () => { if (!pendiente) { pendiente = true; requestAnimationFrame(medir); } }, { passive: true });
      medir();
    }

    for (const form of document.querySelectorAll(".boletin-form")) {
      const estado = form.querySelector(".boletin-estado");
      const enviar = form.querySelector("button");
      form.addEventListener("submit", async e => {
        e.preventDefault();
        enviar.disabled = true;
        estado.textContent = "Enviando…";
        try {
          const r = await fetch(`${form.action}?isAjax=1`, { method: "POST", body: new FormData(form) });
          const d = await r.json();
          if (!r.ok || d.success === false) throw new Error(r.status);
          form.querySelector(".boletin-fila").remove();
          form.querySelector(".boletin-ok").remove();
          estado.textContent = "¡Listo! Si te llega un correo para confirmar, pulsa su enlace y ya estará.";
        } catch {
          form.target = "_blank";
          HTMLFormElement.prototype.submit.call(form);
          enviar.disabled = false;
          estado.textContent = "Termina la suscripción en la pestaña que se ha abierto.";
        }
      });
    }

    const boton = document.querySelector("[data-compartir]");
    if (boton && (navigator.share || navigator.clipboard)) {
      boton.hidden = false;
      boton.addEventListener("click", async () => {
        const datos = { title: document.title, url: location.href };
        if (navigator.share) {
          try { await navigator.share(datos); } catch {}
          return;
        }
        await navigator.clipboard.writeText(datos.url);
        boton.textContent = "Enlace copiado";
        setTimeout(() => { boton.textContent = "Compartir"; }, 2000);
      });
    }
  });
})();
