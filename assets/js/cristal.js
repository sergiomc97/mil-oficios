(() => {
  if (!window.WebGLRenderingContext || matchMedia("(prefers-reduced-transparency: reduce)").matches) return;

  const CDN = "https://cdn.jsdelivr.net/npm/@ybouane/liquidglass@1.0.3/dist/";
  const CARDS = ".destacado, .baldosa, .util, .panel";
  const ajustes = {
    u_refract: 1,
    u_chroma: 0.03,
    u_edgeHL: 0.16,
    u_spec: 0,
    u_fresnel: 0.3,
    u_distort: 0,
    u_alpha: 1,
    u_sat: 0.1,
    u_tint: 0,
    u_brightness: 0,
    u_shadowAlpha: 0,
    u_shadowSpread: 1,
    u_shadowOffY: 0,
    u_bevelMode: 0,
    u_pad: 0,
  };
  const BORDE = 11;

  const oscuro = matchMedia("(prefers-color-scheme: dark)");
  const fondo = document.createElement("canvas");
  const taller = document.createElement("canvas");
  const visibles = new Set();
  const lentes = new Map();
  const ampliado = document.createElement("canvas");
  const MARGEN = 1400;
  let gl, vidrio, panel, tex, k = 1, W = 0, H = 0, M = 0, HE = 0, pendiente = false, quieto = 0;

  const programa = (vs, fs, nombres) => {
    const p = gl.createProgram();
    for (const [tipo, fuente] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(tipo);
      gl.shaderSource(s, fuente);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    for (const n of nombres) u[n] = gl.getUniformLocation(p, n);
    return { p, u, a: gl.getAttribLocation(p, "a_pos") };
  };

  const MANCHAS = [["--m1", 0.08, 0.12, 0.45, 0.35], ["--m2", 0.95, 0.3, 0.4, 0.35], ["--m3", 0.05, 0.72, 0.45, 0.35], ["--m4", 0.92, 0.88, 0.45, 0.35]];

  const mancha = (ctx, color, cx, cy, rx, ry) => {
    const [r, g, b] = color.match(/[\d.]+/g);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx, ry);
    const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g1.addColorStop(0, color);
    g1.addColorStop(0.7, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = g1;
    ctx.fillRect(-2, -2, 4, 4);
    ctx.restore();
  };

  const pintaFondo = () => {
    k = Math.min(devicePixelRatio || 1, 2);
    W = Math.round(fondo.clientWidth * k);
    H = Math.round(fondo.clientHeight * k);
    fondo.width = W;
    fondo.height = H;
    const ctx = fondo.getContext("2d");
    const cuerpo = getComputedStyle(document.body);
    ctx.fillStyle = cuerpo.backgroundColor;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = parseFloat(cuerpo.getPropertyValue("--mancha")) || 0;
    for (const [n, cx, cy, rx, ry] of MANCHAS) mancha(ctx, cuerpo.getPropertyValue(n).trim(), cx * W, cy * H, rx * W, ry * H);
    ctx.globalAlpha = 1;
    M = Math.round(MARGEN * k);
    HE = H + 2 * M;
    ampliado.width = W;
    ampliado.height = HE;
    const ext = ampliado.getContext("2d");
    ext.drawImage(fondo, 0, 0, W, 1, 0, 0, W, M);
    ext.drawImage(fondo, 0, H - 1, W, 1, 0, M + H, W, M);
    ext.drawImage(fondo, 0, M);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ampliado);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    for (const l of lentes.values()) l.clave = "";
  };

  const dibuja = () => {
    let cambio = false;
    gl.useProgram(vidrio.p);
    gl.uniform2f(vidrio.u.u_res, W, HE);
    gl.uniform1f(vidrio.u.u_zRadius, BORDE * k);
    for (const el of visibles) {
      const l = lentes.get(el);
      const r = el.getBoundingClientRect();
      const clave = `${r.left}|${r.top}|${r.width}|${r.height}`;
      if (clave === l.clave) continue;
      l.clave = clave;
      cambio = true;
      const w = Math.round(r.width * k);
      const h = Math.round(r.height * k);
      if (!w || !h) continue;
      if (l.lienzo.width !== w || l.lienzo.height !== h) {
        l.lienzo.width = w;
        l.lienzo.height = h;
      }
      if (taller.width < w || taller.height < h) {
        taller.width = Math.max(taller.width, w);
        taller.height = Math.max(taller.height, h);
      }
      const x = Math.round(r.left * k);
      const y = Math.round(r.top * k) + M;
      gl.viewport(-x, taller.height - h - (HE - y - h), W, HE);
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(0, taller.height - h, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(vidrio.u.u_center, x + w / 2, y + h / 2);
      gl.uniform2f(vidrio.u.u_size, w, h);
      gl.uniform1f(vidrio.u.u_radius, l.radio * k);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      const ctx = l.lienzo.getContext("2d");
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(taller, 0, 0, w, h, 0, 0, w, h);
    }
    return cambio;
  };

  const cuadro = () => {
    pendiente = false;
    quieto = dibuja() ? 0 : quieto + 1;
    if (quieto < 20) despierta();
  };
  const despierta = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(cuadro);
  };
  const mueve = () => {
    quieto = 0;
    despierta();
  };

  const apaga = e => {
    document.documentElement.classList.remove("cristal-vivo");
    fondo.remove();
    for (const l of lentes.values()) l.lienzo.remove();
    if (e) console.warn("Cristal sin WebGL:", e);
  };

  const arranca = async () => {
    try {
      const { VS_GLASS, FS_GLASS } = await import(`${CDN}shaders.js`);
      gl = taller.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: true });
      if (!gl) throw new Error("sin contexto");
      vidrio = programa(VS_GLASS, FS_GLASS, ["u_bgTex", "u_blurTex", "u_center", "u_size", "u_res", "u_radius", "u_zRadius", ...Object.keys(ajustes)]);
      tex = gl.createTexture();
      panel = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, panel);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(vidrio.a);
      gl.vertexAttribPointer(vidrio.a, 2, gl.FLOAT, false, 0, 0);
      gl.useProgram(vidrio.p);
      gl.uniform1i(vidrio.u.u_bgTex, 0);
      gl.uniform1i(vidrio.u.u_blurTex, 0);
      for (const n in ajustes) gl.uniform1f(vidrio.u[n], ajustes[n]);
      gl.disable(gl.BLEND);

      fondo.className = "fondo-vivo";
      fondo.setAttribute("aria-hidden", "true");
      document.body.prepend(fondo);
      pintaFondo();

      const vigia = new IntersectionObserver(entradas => {
        for (const e of entradas) {
          if (e.isIntersecting) visibles.add(e.target);
          else visibles.delete(e.target);
        }
        mueve();
      }, { rootMargin: "200px 0px" });
      for (const el of document.querySelectorAll(CARDS)) {
        const lienzo = document.createElement("canvas");
        lienzo.className = "lente";
        lienzo.setAttribute("aria-hidden", "true");
        el.prepend(lienzo);
        lentes.set(el, { lienzo, clave: "", radio: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0 });
        vigia.observe(el);
      }
      document.documentElement.classList.add("cristal-vivo");

      addEventListener("scroll", mueve, { passive: true });
      addEventListener("resize", () => {
        if (Math.round(fondo.clientWidth * k) !== W || Math.round(fondo.clientHeight * k) !== H) pintaFondo();
        mueve();
      });
      oscuro.addEventListener("change", () => {
        pintaFondo();
        mueve();
      });
      taller.addEventListener("webglcontextlost", () => apaga());
      mueve();
    } catch (e) {
      apaga(e);
    }
  };

  const espera = () => ("requestIdleCallback" in window ? requestIdleCallback(arranca, { timeout: 1500 }) : setTimeout(arranca, 200));
  if (document.readyState === "complete") espera();
  else addEventListener("load", espera, { once: true });
})();
