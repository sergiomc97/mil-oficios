import json
import os
import re
import sys
import urllib.request

API = "https://api.sender.net/v2"
TOKEN = os.environ["SENDER_TOKEN"]
GRUPO = os.environ.get("SENDER_GRUPO", "Boletín")
REMITENTE = "hola@miloficios.es"


def llamar(ruta, datos=None):
    peticion = urllib.request.Request(
        f"{API}/{ruta}",
        data=json.dumps(datos).encode() if datos is not None else None,
        method="POST" if datos is not None else "GET",
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json", "Accept": "application/json"},
    )
    with urllib.request.urlopen(peticion) as r:
        return json.load(r)


html = open(sys.argv[1], encoding="utf-8").read()
mes = re.search(r"<title>(\w+) en Mil Oficios", html).group(1)

grupos = [g["id"] for g in llamar("groups")["data"] if g["title"].strip().lower() == GRUPO.lower()]
if not grupos:
    sys.exit(f"No existe el grupo «{GRUPO}» en Sender")

campana = llamar("campaigns", {
    "title": f"Boletín de {mes.lower()}",
    "subject": f"Qué hacer en {mes.lower()} en el jardín y en casa",
    "preheader": "Las tareas del mes, lo nuevo en la web y una herramienta útil.",
    "from": "Mil Oficios",
    "reply_to": REMITENTE,
    "content_type": "html",
    "content": html,
    "groups": grupos,
})
print("Borrador creado:", campana.get("data", {}).get("id"), campana.get("data", {}).get("status"))
