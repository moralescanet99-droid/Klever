#!/usr/bin/env bash
# Hook Stop (Claude Code): NO deja terminar el turno si hay código del producto o de las pruebas sin reflejar en la memoria del proyecto.
# Regla: todo commit que toque public/, functions/, migrations/, schema.sql, scripts/, tests/ o demo/ debe ir seguido (o acompañado) de una
# modificación de procesos-klever/09-registro-de-cambios.md; y no puede quedar código sin commitear al terminar.
# Para no entrar en bucle: si Claude ya fue bloqueado una vez en este turno (stop_hook_active), deja pasar.
# Uso manual (sin Claude): bash scripts/memoria/comprobar-memoria.sh < /dev/null  → código 0 si todo está al día; mensaje y código 2 si no.
cd "$(dirname "$0")/../.." || exit 0
entrada="$(cat 2>/dev/null || true)"
[ "$(printf '%s' "$entrada" | jq -r '.stop_hook_active // false' 2>/dev/null)" = "true" ] && exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
RUTAS=(public functions migrations schema.sql scripts tests demo)
problemas=()
# 1) código sin commitear (los resultados de las pruebas en rondaNN/ no cuentan)
sucio="$(git status --porcelain -- "${RUTAS[@]}" 2>/dev/null | head -5)"
[ -n "$sucio" ] && problemas+=("Hay cambios de código sin commitear:"$'\n'"$sucio")
# 2) commits de código posteriores a la última anotación en 09-registro-de-cambios.md
ultimo09="$(git log -1 --format=%H -- procesos-klever/09-registro-de-cambios.md 2>/dev/null)"
if [ -n "$ultimo09" ]; then
  pend="$(git log --format='%h %s' "$ultimo09"..HEAD -- "${RUTAS[@]}" 2>/dev/null | head -5)"
  [ -n "$pend" ] && problemas+=("Commits de código sin anotar en procesos-klever/09-registro-de-cambios.md:"$'\n'"$pend")
fi
# 3) memoria modificada pero sin commitear
mem="$(git status --porcelain -- procesos-klever 2>/dev/null | head -5)"
[ -n "$mem" ] && problemas+=("La memoria (procesos-klever/) tiene cambios sin commitear:"$'\n'"$mem")
[ ${#problemas[@]} -eq 0 ] && exit 0
{ echo "MEMORIA DEL PROYECTO desactualizada (comprobación automática):"; printf '%s\n' "${problemas[@]}";
  echo "Actualiza procesos-klever/ (09 con el commit, 05, 04, 06 con el encargo literal; 03/08/01/11 si procede), haz commit y push, y entonces termina."; } >&2
exit 2
