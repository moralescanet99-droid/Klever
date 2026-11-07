#!/usr/bin/env bash
# Hook UserPromptSubmit (Claude Code): con CADA mensaje de Javier recuerda a Claude que la memoria del proyecto se mantiene sola, sin que nadie lo pida.
# No bloquea nada: solo añade contexto. Siguiente número libre de encargo en 06- (C<n>), calculado del propio archivo.
cd "$(dirname "$0")/../.." || exit 0
ult=$(grep -oE '^## C[0-9]+' procesos-klever/06-peticiones-del-usuario.md 2>/dev/null | grep -oE '[0-9]+' | sort -n | tail -1)
sig=$(( ${ult:-0} + 1 ))
texto="MEMORIA DEL PROYECTO (automático): antes de terminar este turno, registra este mensaje del usuario LITERAL en procesos-klever/06-peticiones-del-usuario.md como «## C${sig} · … — …, literal» (salvo que sea trivial, como «sí» sin contexto: entonces anótalo dentro del encargo al que responde). Si el turno cambia código, decisiones o estado: fila en 09-registro-de-cambios.md, 05-estado-actual.md, 04-cronologia.md y, si procede, 03-decisiones.md, 01-contexto-y-reglas.md, 08-entorno-y-trampas.md y 11-traspaso-supervisor.md. Commit y push de procesos-klever/ con el cambio."
jq -n --arg t "$texto" '{hookSpecificOutput: {hookEventName: "UserPromptSubmit", additionalContext: $t}}'
