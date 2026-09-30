# Bitácora — Práctica 4: servidor GraphQL (NestJS)

**URL pública (Render):** https://nestjs-productos-graphql-c0u6.onrender.com/graphql
**Repositorio:** https://github.com/estebangarciaojeda-ui/nestjs-productos-graphql

> Plan gratuito de Render: si el servicio lleva un rato sin uso, la primera petición tarda unos segundos en responder.

## Qué se construyó

Un servidor GraphQL code-first con NestJS (`@nestjs/graphql` + Apollo, puerto 3000, Apollo Sandbox en `/graphql`) que expone tres queries sobre `Producto` y obtiene los datos de la API REST pública de productos mediante `HttpService`:

| Query | Argumento | Qué hace |
|---|---|---|
| `productos` | — | Lista todos los productos. |
| `productoPorId` | `id: Int!` | Devuelve un producto (nullable). Si la API responde 404, Apollo lo muestra como `INTERNAL_SERVER_ERROR`. |
| `productosBaratos` (reto) | `precioMaximo: Float!` | Filtra los productos con `precio <= precioMaximo`. |

Archivos: `src/productos/producto.model.ts`, `src/productos/productos.resolver.ts` y `src/app.module.ts` (`GraphQLModule.forRoot` + `HttpModule.register({})`). El esquema se genera solo en `schema.gql` (raíz del proyecto).

## Resultados verificados

Contra `https://nestjs-productos-api.onrender.com/api/v1/productos` (ids 1, 3 y 4):

- `productos` devuelve los 3 productos.
- `productoPorId(id: 3)` devuelve "Teclado inalámbrico hp".
- `productos { nombre }` devuelve solo el campo `nombre`.
- `productosBaratos(precioMaximo: 50)` devuelve 1 producto (Teclado mecánico, 45.9); con `100` devuelve 2.
- `productoPorId(id: 2)` produce un error (la API responde 404).

## REST frente a GraphQL

Para "todos los productos, solo nombres, más el detalle de uno", con REST necesitaría **2 llamadas**: `GET /api/v1/productos` (que devuelve el objeto completo aunque solo quiera el nombre) y `GET /api/v1/productos/{id}` (endpoint distinto). Con GraphQL se resuelve en **1 petición** pidiendo exactamente los campos necesarios (`productos { nombre }` y `productoPorId(id: 4) { ... }` pueden ir en la misma query).

## Qué cambió al conectar la API REST (Paso 6)

Antes el resolver leía un arreglo `catalogo` en memoria; ahora inyecta `HttpService` y hace `firstValueFrom(this.http.get(...))`. La forma de las queries no cambió, solo el origen de los datos. Si la API se cae o no hay internet, las queries fallan, lo que confirma que los datos ya no están en memoria.

## Diferencias respecto a la guía

- **Sin `@nestjs/observe`:** el `app.module.ts` de la guía importa `createObserveModule` de `@nestjs/observe`, pero `nest new` (CLI 12.0.8) no genera ni instala ese paquete, así que no compilaría. Se omitió `ObserveModule`; el resto del módulo es igual.
- **GraphiQL en vez de Apollo Sandbox:** `http://localhost:3000/graphql` abre GraphiQL (el IDE por defecto de `@nestjs/apollo` 14), no Apollo Sandbox como dice la guía. Sirve igual: editor de queries, panel de documentación del esquema y resultados. Las queries se ejecutaron ahí con éxito.
- **CLI sin instalación global:** el CLI global instalado era 11.0.14; el proyecto se creó con `npx @nestjs/cli@12.0.8 new` para no modificar la instalación global.
- **API usada:** la de la guía (`nestjs-productos-api.onrender.com`, ids 1, 3, 4). La API propia de la práctica 2 (`nestjs-productos-api-grxr.onrender.com`) tiene otros datos (ids 2 y 3), así que los resultados esperados de la guía (50 → 1 producto, 100 → 2) no coincidirían.

## Declaración de uso de IA

- Herramienta(s): Claude (Anthropic)
- Nivel de uso: 2-3 (borrador/revisor)
- Qué se le pidió: montar el proyecto siguiendo la guía paso a paso (dependencias fijadas, modelo, resolver, módulo, conexión a la API REST y el reto `productosBaratos`) y redactar esta bitácora.
- Qué se modificó/verificó manualmente: se compiló y se arrancó el servidor, y se ejecutaron por HTTP todas las queries de la guía contra la API real, comprobando que los resultados coinciden con los esperados; también se ejecutó `productosBaratos(precioMaximo: 100)` desde la interfaz GraphiQL en el navegador (devolvió los 2 productos esperados); se detectó y corrigió la referencia a `@nestjs/observe`, que no existe en el proyecto generado.
