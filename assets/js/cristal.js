(() => {
  const script = document.currentScript;
  const raices = [...document.querySelectorAll(".vidriera")];
  if (!raices.length || !window.WebGLRenderingContext || matchMedia("(prefers-reduced-transparency: reduce)").matches) return;

  const vertical = matchMedia("(orientation: portrait)");
  const oscuro = matchMedia("(prefers-color-scheme: dark)");
  const carga = src => new Promise((ok, mal) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = mal;
    img.src = src;
  });
  const ajustes = {
    cornerRadius: 22,
    zRadius: 22,
    refraction: 0.65,
    blurAmount: 0.1,
    chromAberration: 0.04,
    edgeHighlight: 0.1,
    specular: 0.15,
    brightness: 0.06,
    shadowOpacity: 0.16,
    shadowSpread: 14,
    shadowOffsetY: 6,
  };

  const arranca = async () => {
    try {
      const [{ LiquidGlass }, ancha, alta] = await Promise.all([
        import("https://cdn.jsdelivr.net/npm/@ybouane/liquidglass@1.0.3/dist/index.js"),
        carga(script.dataset.ancha),
        carga(script.dataset.alta),
      ]);
      const capas = raices.map(raiz => {
        const capa = document.createElement("canvas");
        capa.className = "vidriera-fondo";
        capa.setAttribute("aria-hidden", "true");
        raiz.prepend(capa);
        return capa;
      });

      const pinta = () => {
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        const img = vertical.matches ? alta : ancha;
        const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const iw = img.naturalWidth * s;
        const ih = img.naturalHeight * s;
        const velo = getComputedStyle(document.body).getPropertyValue("--velo").trim();
        for (const capa of capas) {
          capa.width = w;
          capa.height = h;
          capa.style.width = `${w}px`;
          capa.style.height = `${h}px`;
          const ctx = capa.getContext("2d");
          ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
          if (velo && velo !== "transparent") {
            ctx.fillStyle = velo;
            ctx.fillRect(0, 0, w, h);
          }
        }
      };

      const coloca = () => {
        const h = document.documentElement.clientHeight;
        const movidas = [];
        capas.forEach((capa, i) => {
          const r = raices[i].getBoundingClientRect();
          if (r.bottom < -h || r.top > h * 2) return;
          capa.style.transform = `translate(${-r.left}px, ${-r.top}px)`;
          movidas.push(i);
        });
        return movidas;
      };

      pinta();
      coloca();
      const instancias = await Promise.all(raices.map((raiz, i) => LiquidGlass.init({
        root: raiz,
        glassElements: [...raiz.children].filter(el => el !== capas[i] && el.matches(".panel, .util, .baldosa, .destacado")),
        defaults: ajustes,
      })));
      requestAnimationFrame(() => document.documentElement.classList.add("cristal-vivo"));

      let pendiente = false;
      const actualiza = () => {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(() => {
          pendiente = false;
          for (const i of coloca()) instancias[i].markChanged(capas[i]);
        });
      };
      const repinta = () => {
        pinta();
        coloca();
        instancias.forEach((inst, i) => inst.markChanged(capas[i]));
      };
      addEventListener("scroll", actualiza, { passive: true });
      addEventListener("resize", repinta);
      vertical.addEventListener("change", repinta);
      oscuro.addEventListener("change", repinta);
    } catch (e) {
      document.documentElement.classList.remove("cristal-vivo");
      document.querySelectorAll(".vidriera-fondo").forEach(c => c.remove());
      console.warn("Cristal sin WebGL:", e);
    }
  };

  const espera = () => ("requestIdleCallback" in window ? requestIdleCallback(arranca, { timeout: 2000 }) : setTimeout(arranca, 300));
  if (document.readyState === "complete") espera();
  else addEventListener("load", espera, { once: true });
})();
