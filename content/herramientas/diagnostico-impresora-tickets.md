---
title: "La impresora de tickets no imprime: diagnóstico paso a paso"
description: "Responde unas preguntas de sí o no y averigua por qué no imprime la impresora de tickets de tu tienda antes de llamar al técnico."
seccion: negocio
arbol:
  inicio: blanco
  nodos:
    blanco:
      pregunta: "¿Sale el papel, pero en blanco?"
      si: reves
      no: claro
    claro:
      pregunta: "¿Imprime, pero muy claro o con rayas blancas?"
      si: cabezal
      no: luzerror
    luzerror:
      pregunta: "¿Hay alguna luz roja o naranja encendida o parpadeando?"
      si: tapa
      no: encendida
    tapa:
      pregunta: "¿Tiene papel y la tapa está cerrada hasta hacer clic?"
      si: atasco
      no: papel
    encendida:
      pregunta: "¿Está encendida la luz de encendido?"
      si: prueba
      no: corriente
    prueba:
      pregunta: "¿Imprime la página de prueba? En muchos modelos sale al encenderla con el botón de avance del papel pulsado."
      si: conexion
      no: tecnico
    reves:
      resultado: "El rollo está al revés o no es térmico"
      texto: "El papel térmico solo imprime por una cara. Rasca con la uña: la cara que se oscurece tiene que mirar al cabezal. Dale la vuelta al rollo."
    cabezal:
      resultado: "Cabezal sucio o papel de mala calidad"
      texto: "Con la impresora apagada y fría, pasa por el cabezal un bastoncillo con alcohol isopropílico y deja que se seque. Si sigue igual, prueba con un rollo de otra marca."
    papel:
      resultado: "Le falta papel o la tapa no ha encajado"
      texto: "Pon un rollo y cierra la tapa apretando hasta oír el clic. Con la tapa mal encajada, muchas impresoras no imprimen y encienden la luz de error."
    atasco:
      resultado: "Atasco o cabezal recalentado"
      texto: "Apágala, abre la tapa, quita los restos de papel y espera unos minutos a que se enfríe. Si al encenderla vuelve la luz de error, toca llamar al técnico."
    corriente:
      resultado: "No le llega corriente"
      texto: "Revisa el enchufe, la regleta y el cable que va del transformador a la impresora, que es el que más se suelta. Prueba en otro enchufe."
    conexion:
      resultado: "La impresora funciona: falla la conexión"
      texto: "El problema está entre el ordenador y la impresora. Revisa el cable USB o de red, reinicia el ordenador de la caja y comprueba en la configuración del TPV que está elegida la impresora correcta."
    tecnico:
      resultado: "Fallo de la propia impresora"
      texto: "Si tienes otro cable de corriente compatible, pruébalo. Si sigue sin imprimir la página de prueba, el fallo es interno y es momento de llamar al servicio técnico."
---

## Cómo usarlo

Trabajo a diario con programas de TPV, y la mayoría de las llamadas por «la impresora no imprime» se resuelven sin técnico: un rollo al revés, una tapa mal cerrada o un cable suelto. Las preguntas van de lo más habitual a lo menos.

Si tu impresora no se parece a la típica de tickets térmica, por ejemplo una de agujas para cocina, algunas preguntas no aplican.
