import json
import os
import re
import sys
import urllib.request

API = "https://api.brevo.com/v3"
CLAVE = os.environ["BREVO_KEY"]
LISTA = os.environ.get("BREVO_LISTA", "Boletín")
REMITENTE = {"name": "Mil Oficios", "email": "hola@miloficios.es"}


def fallo(mensaje):
    print(f"::error::{mensaje}")
    sys.exit(1)


def llamar(ruta, datos=None):
    peticion = urllib.request.Request(
        f"{API}/{ruta}",
        data=json.dumps(datos).encode() if datos is not None else None,
        method="POST" if datos is not None else "GET",
        headers={"api-key": CLAVE, "Content-Type": "application/json", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(peticion) as r:
            cuerpo = r.read()
            return json.loads(cuerpo) if cuerpo else {}
    except urllib.error.HTTPError as e:
        fallo(f"Brevo respondió {e.code} en {ruta}: {e.read().decode()[:300]}")


html = open(sys.argv[1], encoding="utf-8").read()
mes = re.search(r"<title>(\w+) en Mil Oficios", html).group(1).lower()

listas = [l["id"] for l in llamar("contacts/lists?limit=50")["lists"] if l["name"].strip().lower() == LISTA.lower()]
if not listas:
    fallo(f"No existe la lista «{LISTA}» en Brevo")

campana = llamar("emailCampaigns", {
    "name": f"Boletín de {mes}",
    "subject": f"Qué hacer en {mes} en el jardín y en casa",
    "previewText": "Las tareas del mes, lo nuevo en la web y una herramienta útil.",
    "sender": REMITENTE,
    "replyTo": REMITENTE["email"],
    "htmlContent": html,
    "recipients": {"listIds": listas},
})
print("Borrador creado en Brevo:", campana.get("id"))
if os.environ.get("ENVIAR") == "1":
    llamar(f"emailCampaigns/{campana['id']}/sendNow", {})
    print("Enviado")
