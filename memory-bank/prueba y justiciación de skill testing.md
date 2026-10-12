# Prueba y justificación de la skill de testing

## Skill ejecutada

Se aplicaron al frontend las pautas de `javascript-testing-patterns`, usando el framework existente Vitest. No se incorporaron Jest, Testing Library ni dependencias nuevas: el alcance de esta ejecución fue la suite unitaria de las funciones financieras puras.

## Ejecución y resultado

Comando ejecutado desde `frontend/`:

```bash
npm run test:coverage
```

Resultado: 10 tests aprobados. La cobertura del módulo `frontend/src/lib/financial-utils.ts` fue:

- Statements: 100% (36/36)
- Branches: 100% (12/12)
- Functions: 100% (13/13)
- Lines: 100% (35/35)

También pasó `npm run lint`, no se encontraron diagnósticos en el archivo de tests y `git diff --check` no reportó problemas en los archivos modificados.

## Casos ejercitados

La suite verifica los totales de KPIs, el margen cuando no hay ingresos, pérdidas cuando los egresos superan los ingresos, agregaciones mensuales, orden cronológico entre años, fechas del primer día de mes, periodo de un solo mes y periodo vacío, además de formatos de moneda y porcentaje.

Se añadieron casos para cubrir las ramas que inicialmente no tenían prueba: movimientos de un solo mes y cálculo mensual sin ingresos. También se agregó un caso de pérdida en los KPIs para proteger un resultado financiero importante.

## Por qué resulta útil

La pantalla calcula KPIs y márgenes a partir de movimientos financieros. Un error de agregación, división por cero, orden de meses o formato puede mostrar cifras engañosas. Las pruebas de funciones puras son rápidas, deterministas y no dependen de la API ni de un navegador, por lo que detectan esas regresiones con bajo costo.

## Alcance y siguientes usos

La cobertura indicada corresponde únicamente a `financial-utils.ts`; no representa cobertura completa del frontend. No valida el renderizado de componentes, el fetch, los estados de carga/error ni el flujo de extremo a extremo. Si se modifican esos comportamientos, conviene añadir pruebas de componente o integración: simular dependencias externas y consultar controles por roles/nombres accesibles, evitando acoplar los tests a detalles internos del DOM.
