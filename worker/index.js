const TEMAS = {
  jardin: "una planta que va mal. Fíjate en las hojas, los tallos, la tierra y si hay bichos o manchas"
};

const instrucciones = tema => `Eres Tito Garlopa, que escribe en miloficios.es. Te mandan una foto de ${tema}. A veces viene con una nota.
Responde en español de España, tuteando, como un vecino que sabe del tema: concreto y sin rodeos.
- problema: lo más probable que le pasa, en una frase corta. Si la foto no deja verlo claro, dilo.
- que_hacer: de 2 a 4 frases con lo que harías ahora mismo. Si no se puede saber solo con la foto, di qué mirar.
- enlace: la url de la lista que más ayude, o una cadena vacía si ninguna encaja. Solo urls de la lista.
Si la foto no muestra eso, dilo en problema y deja que_hacer y enlace vacíos. No inventes nombres de productos ni cifras.`;

const ESQUEMA = {
  type: "object",
  properties: { problema: { type: "string" }, que_hacer: { type: "string" }, enlace: { type: "string" } },
  required: ["problema", "que_hacer", "enlace"]
};

export default {
  async fetch(req, env) {
    const cabeceras = {
      "Access-Control-Allow-Origin": env.ORIGEN,
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };
    const responde = (datos, estado = 200) => new Response(JSON.stringify(datos), { status: estado, headers: cabeceras });

    if (req.method === "OPTIONS") return new Response(null, { headers: cabeceras });
    if (req.method !== "POST" || req.headers.get("Origin") !== env.ORIGEN) return responde({ error: "origen" }, 403);

    const { foto, nota = "", seccion, pagina } = await req.json().catch(() => ({}));
    if (typeof foto !== "string" || foto.length > 2_000_000) return responde({ error: "foto" }, 400);
    if (!Object.hasOwn(TEMAS, seccion) || !/^\/herramientas\/[a-z0-9-]+\/$/.test(pagina)) return responde({ error: "seccion" }, 400);

    const clave = `${req.headers.get("CF-Connecting-IP")}:${new Date().toISOString().slice(0, 10)}`;
    const usadas = Number(await env.CUPO.get(clave)) || 0;
    if (usadas >= Number(env.LIMITE)) return responde({ error: "limite" }, 429);

    const enlaces = await fetch(`${env.ORIGEN}${pagina}index.json`, { cf: { cacheTtl: 3600 } })
      .then(r => r.json()).catch(() => []);

    const peticion = JSON.stringify({
      system_instruction: { parts: [{ text: instrucciones(TEMAS[seccion]) }] },
      contents: [{
        parts: [
          { inline_data: { mime_type: "image/jpeg", data: foto } },
          { text: `Nota: ${String(nota).slice(0, 300) || "ninguna"}\nLista de enlaces:\n${enlaces.map(e => `${e.url} | ${e.titulo}`).join("\n")}` }
        ]
      }],
      generationConfig: { responseMimeType: "application/json", responseSchema: ESQUEMA }
    });
    let r;
    for (const modelo of env.MODELOS.split(",")) {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: peticion
      });
      if (r.ok) break;
    }
    if (r.status === 429) return responde({ error: "agotado" }, 503);
    if (!r.ok) return responde({ error: "ia" }, 502);

    try {
      const texto = (await r.json()).candidates[0].content.parts[0].text;
      const { problema, que_hacer, enlace } = JSON.parse(texto);
      const elegido = enlaces.find(e => e.url === enlace);
      await env.CUPO.put(clave, String(usadas + 1), { expirationTtl: 86400 });
      return responde({ problema, que_hacer, enlace: elegido || null });
    } catch {
      return responde({ error: "ia" }, 502);
    }
  }
};
