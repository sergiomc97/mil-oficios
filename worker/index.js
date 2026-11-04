const TEMAS = {
  jardin: "una planta que va mal. Fíjate en las hojas, los tallos, la tierra y si hay bichos o manchas"
};

const TITO = "Eres Tito Garlopa, que escribe en miloficios.es. Responde en español de España, tuteando, como un vecino que sabe del tema: concreto y sin rodeos. No inventes nombres de productos ni cifras.";

const PASE = "8bb7b76784a54bc2d81bfd9671750114f72970e2a03c71a28c80de2df3321834";

const TRAMOS = ["-5", "-10", "-15", "-20", "-25"];

const texto = (v, max) => String(v ?? "").slice(0, max);

const TAREAS = {
  foto: {
    cuenta: true,
    valida: d => typeof d.foto === "string" && d.foto.length < 2_000_000 && Object.hasOwn(TEMAS, d.seccion),
    instrucciones: d => `${TITO}
Te mandan una foto de ${TEMAS[d.seccion]}. A veces viene con una nota.
- problema: lo más probable que le pasa, en una frase corta. Si la foto no deja verlo claro, dilo.
- que_hacer: de 2 a 4 frases con lo que harías ahora mismo. Si no se puede saber solo con la foto, di qué mirar.
- enlace: la url de la lista que más ayude, o una cadena vacía si ninguna encaja. Solo urls de la lista.
Si la foto no muestra eso, dilo en problema y deja que_hacer y enlace vacíos.`,
    partes: (d, pagina) => [
      { inline_data: { mime_type: "image/jpeg", data: d.foto } },
      { text: `Nota: ${texto(d.nota, 300) || "ninguna"}\nLista de enlaces:\n${pagina.enlaces.map(e => `${e.url} | ${e.titulo}`).join("\n")}` }
    ],
    esquema: {
      type: "object",
      properties: { problema: { type: "string" }, que_hacer: { type: "string" }, enlace: { type: "string" } },
      required: ["problema", "que_hacer", "enlace"]
    },
    responde: (r, pagina) => ({ problema: r.problema, que_hacer: r.que_hacer, enlace: pagina.enlaces.find(e => e.url === r.enlace) || null })
  },
  zona: {
    cuenta: false,
    valida: d => d.seccion === "jardin" && d.sitio?.nombre,
    instrucciones: () => `${TITO}
Te dan un pueblo de España con sus coordenadas. Estima la temperatura mínima a la que se llega en un invierno normal, no en uno excepcional, teniendo en cuenta su altitud, si es de interior o de costa y si está en un valle o en una meseta. Si dudas entre dos tramos, elige el más frío: es mejor quedarse corto que perder plantas.
- minima: el tramo más frío que se alcanza: "-5" (casi no hiela, hasta −5 °C), "-10" (de −5 a −10), "-15" (de −10 a −15), "-20" (de −15 a −20) o "-25" (por debajo de −20).
- explicacion: una frase corta de por qué, como «Está a unos 1.000 m, en el interior: hiela fuerte».`,
    partes: d => [{ text: `${texto(d.sitio.nombre, 120)} (${Number(d.sitio.lat)}, ${Number(d.sitio.lon)})` }],
    esquema: {
      type: "object",
      properties: { minima: { type: "string", enum: TRAMOS }, explicacion: { type: "string" } },
      required: ["minima", "explicacion"]
    },
    responde: r => r
  },
  plan: {
    cuenta: true,
    valida: d => d.seccion === "jardin" && TRAMOS.includes(d.minima),
    instrucciones: () => `${TITO}
Alguien quiere plantar en su jardín y te dice su pueblo, cuánto hiela, el sol y la tierra. Elige de 3 a 5 plantas, solo de la lista que te damos.
- Nunca recomiendes una planta que no aguante la mínima de su zona. Si aguanta justo, dilo en «porque» y di cómo protegerla.
- Ten en cuenta el sol, la tierra y la nota, si la hay.
- resumen: una o dos frases sobre su jardín y qué tipo de plantas le van.
- plantas: id exacto de la lista, porque (una frase) y donde (una frase concreta: «pegada a una pared al sur», «en el borde del camino»).`,
    partes: (d, pagina) => [{
      text: `Pueblo: ${texto(d.sitio?.nombre, 120) || "no lo ha dicho"}
Mínima en invierno: hasta ${d.minima} °C
Sol: ${texto(d.sol, 60)}
Tierra: ${texto(d.tierra, 60)}
Nota: ${texto(d.nota, 300) || "ninguna"}
Plantas:
${pagina.plantas.map(p => `${p.id} | ${p.nombre} (${p.lat}) | frío: ${p.frio} | sol: ${p.sol} | tierra: ${p.tierra} | agua: ${p.agua} | ${p.uso}`).join("\n")}`
    }],
    esquema: {
      type: "object",
      properties: {
        resumen: { type: "string" },
        plantas: {
          type: "array",
          items: { type: "object", properties: { id: { type: "string" }, porque: { type: "string" }, donde: { type: "string" } }, required: ["id", "porque", "donde"] }
        }
      },
      required: ["resumen", "plantas"]
    },
    responde: (r, pagina) => ({
      resumen: r.resumen,
      plantas: r.plantas.filter(p => pagina.plantas.some(q => q.id === p.id)).slice(0, 5)
    })
  }
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

    const d = await req.json().catch(() => ({}));
    const tarea = TAREAS[d.tipo || "foto"];
    if (!tarea || !/^\/herramientas\/[a-z0-9-]+\/$/.test(d.pagina) || !tarea.valida(d)) return responde({ error: "datos" }, 400);

    const clave = `${req.headers.get("CF-Connecting-IP")}:${new Date().toISOString().slice(0, 10)}`;
    const usadas = Number(await env.CUPO.get(clave)) || 0;
    const huella = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto(d.pase, 100))))].map(b => b.toString(16).padStart(2, "0")).join("");
    const cuenta = tarea.cuenta && huella !== PASE;
    if (cuenta && usadas >= Number(env.LIMITE)) return responde({ error: "limite" }, 429);

    const pagina = await fetch(`${env.ORIGEN}${d.pagina}index.json`, { cf: { cacheTtl: 3600 } })
      .then(r => r.json()).catch(() => ({ enlaces: [], plantas: [] }));

    const peticion = JSON.stringify({
      system_instruction: { parts: [{ text: tarea.instrucciones(d) }] },
      contents: [{ parts: tarea.partes(d, pagina) }],
      generationConfig: { responseMimeType: "application/json", responseSchema: tarea.esquema }
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
      const respuesta = JSON.parse((await r.json()).candidates[0].content.parts[0].text);
      if (cuenta) await env.CUPO.put(clave, String(usadas + 1), { expirationTtl: 86400 });
      return responde(tarea.responde(respuesta, pagina));
    } catch {
      return responde({ error: "ia" }, 502);
    }
  }
};
