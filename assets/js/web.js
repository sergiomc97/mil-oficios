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
    const guardar = (clave, valor) => { try { localStorage.setItem(clave, JSON.stringify(valor)); } catch {} };
    const leer = clave => { try { return JSON.parse(localStorage.getItem(clave)) || []; } catch { return []; } };

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

    const volver = document.querySelector(".volver");
    volver?.addEventListener("click", e => {
      if (document.referrer.startsWith(location.origin) && history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });

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
