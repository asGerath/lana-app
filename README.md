## Stack Tecnico

- Next.js 16 con App Router
- React 19
- TypeScript
- Redux Toolkit + React Redux
- Styled Components
- dnd-kit para drag and drop
- CryptoJS para hashing y cifrado
- LZ-String para compresion del board en storage
- Jest + React Testing Library configurados en el proyecto

## Funcionalidades Implementadas

### Autenticacion

- Login contra ReqRes usando una API key privada del servidor.
- Ruta interna de servidor en `src/app/api/auth/login/route.ts` para evitar exponer la key en el cliente.
- Generacion de clave dinamica desde frontend con `timestamp` y `nonce`.
- Validacion de esa clave dinamica del lado servidor antes de reenviar el login a ReqRes.
- Simulacion de latencia aleatoria para evitar dependencias de tiempo fijo.
- Persistencia de sesion con expiracion.
- Solo se persiste el token cifrado en `localStorage`; el token plano no queda almacenado.
- Restauracion automatica de sesion al recargar la aplicacion.

### Tablero de Tareas

- Board con tres columnas: `Por hacer`, `En progreso` y `Completado`.
- Drag and drop entre columnas y dentro de la misma columna.
- Crear tareas desde modal por columna.
- Editar, eliminar, mover y marcar favoritas desde el menu contextual de cada card.
- Confirmacion antes de eliminar.
- Prevencion de titulos duplicados.
- Marcado de favoritos por tarea.
- Busqueda por texto y filtro por estado, incluyendo vista de favoritos.
- Persistencia del board por usuario.
- Generacion manual de IDs con usuario, fecha y hash.
- Versionado por tarea para soporte de bloqueo optimista.

### Persistencia y Datos

- Estructura de datos de tareas basada en un `TaskTree` y no en un array plano.
- Cache personalizada en memoria para reducir lecturas repetidas a `localStorage`.
- Serializacion del board a JSON.
- Compresion del board con `LZString.compressToUTF16` antes de guardarlo.
- Publicacion de actualizaciones del board para sincronizacion realtime por SSE.

### UI y Tema

- Tema centralizado en `src/styles/theme.ts` con tokens de color, espaciado, radios, sombras y tipografia.
- Componentes principales del login y del board conectados al tema para reflejar el sistema visual real del proyecto.

## Arquitectura del Proyecto

El proyecto esta organizado por responsabilidades:

- `src/app`: rutas de Next.js, layout global y API routes.
- `src/components`: componentes de UI reutilizables, agrupados por dominio.
- `src/features`: logica de negocio separada por feature (`auth`, `tasks`).
- `src/store`: slices, store y hooks tipados de Redux.
- `src/lib`: clientes, keys de storage y utilidades compartidas.
- `src/styles`: tema global y estilos base.

## Flujo de Autenticacion

El flujo de autenticacion actual es deliberadamente estricto:

1. El usuario completa email y password en el login.
2. El frontend genera una clave dinamica con:
	 - `timestamp`
	 - `nonce`
	 - `hash SHA256(timestamp-nonce)`
3. El cliente envia `email`, `password`, `key`, `timestamp` y `nonce` a `/api/auth/login`.
4. La API route valida:
	 - que los campos existan
	 - que el `timestamp` no haya expirado
	 - que el `hash` coincida con el valor esperado
5. Si la validacion es correcta, la API route llama a ReqRes usando la API key privada del servidor.
6. Si las credenciales de la aplicacion son correctas, la API route hace proxy a ReqRes usando credenciales tecnicas internas compatibles con ese servicio.
7. Si ReqRes responde con token, el cliente guarda la sesion cifrada.
8. En el arranque de la app se intenta restaurar la sesion desde `localStorage`.

### Por que se implemento asi

- La API key no debe exponerse en el navegador.
- La validacion de seguridad no debe ocurrir solo en frontend.
- La prueba tecnica pedia una validacion dinamica del lado backend simulado.
- El modo estricto evita dependencias de mocks como camino principal.

## Manejo de Estado

Redux esta dividido en tres slices principales:

- `app`: estado general de la aplicacion.
- `auth`: usuario, sesion, loading y errores de autenticacion.
- `tasks`: board, filtros, loading y errores de tareas.

El store esta configurado en `src/store/index.ts` y expone:

- `RootState`
- `AppDispatch`
- hooks tipados desde `src/store/hooks.ts`

## Modelo de Datos de Tareas

El board se modela como un arbol simple:

```ts
type TaskTree = {
	tasksById: Record<string, TaskNode>;
	columns: Record<ColumnId, Column>;
	columnOrder: ColumnId[];
};
```

Esto permite:

- acceso rapido por id
- movimiento eficiente entre columnas
- separacion entre orden visual y contenido
- mejor soporte para favoritos, versiones y filtros

### Estructura de una tarea

```ts
type TaskNode = {
	id: string;
	title: string;
	description?: string;
	status: 'pending' | 'in_progress' | 'completed';
	favorite: boolean;
	createdBy: string;
	createdAt: number;
	updatedAt: number;
	version: number;
};
```

## Persistencia

### Sesion

La sesion se guarda en `localStorage` con:

- usuario
- token cifrado
- fecha de expiracion

El token plano se mantiene solo en memoria de la aplicacion mientras la sesion esta activa.

Cuando la sesion expira o no puede parsearse correctamente, se limpia automaticamente.

### Board

El board se persiste por usuario utilizando una key de storage basada en el `userId`.

Proceso de guardado:

1. El board se guarda en cache en memoria.
2. Se serializa a JSON.
3. Se comprime con LZ-String.
4. Se almacena en `localStorage`.

Proceso de lectura:

1. Se intenta leer desde cache.
2. Si no existe cache, se consulta `localStorage`.
3. Se descomprime y deserializa.
4. Se vuelve a hidratar la cache.

## Bloqueo Optimista

Cada tarea contiene una propiedad `version`.

Cuando una tarea se edita:

- el cliente envia una `expectedVersion`
- el reducer valida que coincida con la version actual
- si no coincide, se considera conflicto y se informa un error

Esto simula concurrencia y evita sobrescribir cambios invisibles.

## Realtime Actual

El proyecto ya implementa sincronizacion realtime con **SSE (Server-Sent Events)** por usuario.

Implementacion actual:

- stream SSE en `GET /api/tasks/stream?userId=...`
- publicacion de cambios en `POST /api/tasks/realtime`
- broker en memoria para conexiones activas (`src/lib/sse-broker.ts`)
- sincronizacion cliente con `EventSource` desde `useTaskRealtimeSSE`

Alcance actual:

- cumple el requisito tecnico de realtime usando SSE
- mantiene el stream por proceso de servidor (suficiente para entorno de prueba tecnica)
- puede evolucionar a infraestructura distribuida o WebSocket si el producto lo requiere

## UI y Experiencia de Usuario

### Login

- formulario con validacion basica
- manejo de loading y mensajes de error
- credenciales demo propias de la aplicacion, mapeadas internamente a ReqRes

### Board

- navbar superior con buscador y filtro integrados
- creacion de tareas desde el CTA `+ Nueva tarea` de cada columna
- edicion, favoritos, eliminacion y movimiento manual desde el menu de cada card
- filtro dedicado de favoritos junto al resto de estados del tablero
- layout responsive para desktop y mobile
- correccion de overflow horizontal en cards y columnas
- prevencion de estiramiento forzado entre columnas del grid

## Variables de Entorno

Configura un archivo `.env.local` en la raiz del proyecto:

```env
REQRES_API_KEY=tu_api_key_real
```

### Variable requerida

- `REQRES_API_KEY`: workspace key de ReqRes usada exclusivamente del lado servidor.

### Importante

- No uses `NEXT_PUBLIC_REQRES_API_KEY` para este flujo.
- El proyecto ya esta preparado para que la key permanezca privada.
- Si cambias `.env.local`, reinicia el servidor de desarrollo.

## Credenciales de Prueba

```text
email: ejemplo@prestalana.com
password: user99
```

## Instalacion

```bash
npm install
```

## Scripts Definidos

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run test:coverage
```

### Estado actual de los scripts

- `npm run build`: validado correctamente.
- `npm run dev`: flujo funcional validado localmente.
- `npm run test`: validado correctamente con `39` suites y `120` tests pasando.
- `npm run test:coverage`: validado correctamente; cobertura actual aproximada de `93.33%` en statements.
- `npm run lint`: operativo con ESLint CLI (`eslint .`) y validado en el proyecto.

## Testing Actual

- Suite automatizada con Jest + React Testing Library sobre autenticacion, board, slices, storage, selectores y utilidades.
- Cobertura fuerte en login, auth, storage, reducers, servicios y rutas API.
- Cobertura agregada para validacion backend de titulos, favoritos en filtros, sincronizacion de tareas por SSE y componentes principales del board.
- El board ya cuenta con pruebas directas sobre `TaskCard`, `DroppableColumn`, `DraggableTaskCard` y `TaskForm`.

## Ejecucion Local

1. Instala dependencias.
2. Crea `.env.local` con `REQRES_API_KEY`.
3. Ejecuta `npm run dev`.
4. Abre `http://localhost:3000`.
5. Inicia sesion con las credenciales demo.

## Ejemplo de Verificacion de ReqRes

Puedes verificar que la API key es valida con:

```bash
curl -H "x-api-key: TU_REQRES_API_KEY" https://reqres.in/api/users?page=2
```

Y el login real con:

```bash
curl -X POST "https://reqres.in/api/login" \
	-H "Content-Type: application/json" \
	-H "x-api-key: TU_REQRES_API_KEY" \
	-d '{"email":"eve.holt@reqres.in","password":"cityslicka"}'
```

## Archivos Clave

### Autenticacion

- `src/app/api/auth/login/route.ts`: login server-side y validacion previa.
- `src/features/auth/auth.service.ts`: cliente de login hacia la API interna.
- `src/features/auth/dynamic-key.ts`: generacion de clave dinamica.
- `src/features/auth/validate-key.ts`: validacion de la clave.
- `src/features/auth/auth-storage.ts`: persistencia y restauracion de sesion.
- `src/lib/reqres.ts`: configuracion privada de ReqRes.

### Tareas

- `src/features/tasks/types.ts`: tipos del board.
- `src/features/tasks/task-id.ts`: generacion manual de ids.
- `src/features/tasks/task-storage.ts`: persistencia por usuario.
- `src/features/tasks/task-cache.ts`: cache en memoria.
- `src/features/tasks/task-serializer.ts`: compresion y descompresion.
- `src/store/slices/tasksSlice.ts`: reducers de tareas.
- `src/app/api/tasks/stream/route.ts`: stream SSE por usuario.
- `src/app/api/tasks/realtime/route.ts`: publicacion de eventos realtime.
- `src/app/api/tasks/validate-title/route.ts`: validacion backend simulada de nombre de tarea.
- `src/features/tasks/useTaskRealtimeSSE.ts`: suscripcion cliente al stream SSE.
- `src/features/tasks/task-realtime.api.ts`: cliente para publicar cambios de board.
- `src/features/tasks/task-title-validation.ts`: regla de negocio para validar nombres con caracteres especiales.
- `src/features/tasks/task-title-validation.service.ts`: cliente frontend para validacion backend de nombre.
- `src/lib/sse-broker.ts`: broker en memoria para conexiones SSE.

### UI

- `src/components/auth/LoginForm.tsx`: formulario de login.
- `src/components/board/Board.tsx`: grid principal del board.
- `src/components/board/DroppableColumn.tsx`: columna droppable.
- `src/components/board/TaskCard.tsx`: card de tarea y menu contextual.
- `src/components/board/TaskFilters.tsx`: buscador y filtro de estado.
- `src/components/nav/BoardNav.tsx`: cabecera del board.
- `src/styles/theme.ts`: tokens visuales centralizados de color, sombras y tipografia.

## Decisiones de Diseño Relevantes

### 1. API key del lado servidor

Se eligio una API route interna para evitar exponer credenciales en el navegador.

### 2. Estructura `TaskTree`

Se eligio una estructura compuesta por `tasksById`, `columns` y `columnOrder` para mejorar operaciones de lectura, orden y movimiento.

### 3. Persistencia comprimida

Se usa compresion antes de escribir en storage para reducir el tamaño del payload y cumplir con el requisito de serializacion y compresion.

### 4. Versionado por tarea

Se uso `version` para soportar una forma simple y clara de bloqueo optimista.

### 5. Navbar con filtros integrados

Se movio el buscador al navbar para centralizar acciones de navegacion y filtrado dentro de la misma capa visual.

## Estado Frente a la Prueba Tecnica

### Ya cubierto

- Next.js
- TypeScript
- Redux Toolkit
- Styled Components
- Login con ReqRes
- Persistencia de sesion
- Redireccion a board
- Token cifrado en storage
- Retardo aleatorio de autenticacion
- Drag and drop
- CRUD de tareas
- Duplicados bloqueados
- Favoritos
- Filtro y busqueda
- Filtro dedicado de favoritos
- Testing automatizado
- Cache en memoria
- Bloqueo optimista
- Serializacion y compresion
- Persistencia por usuario
- Estructura de datos no trivial
- SSE realtime por usuario
- Validacion backend simulada de nombres con caracteres especiales

### Pendiente o parcial

- configuracion mas estricta de reglas ESLint si se busca una entrega mas dura
- cobertura directa de piezas de infraestructura no criticas como `styled-components-registry` o estilos globales, si se quisiera llevar la cobertura aun mas lejos

## Posibles Siguientes Pasos

1. Endurecer reglas ESLint segun el nivel de exigencia del evaluador.
2. Escalar realtime a broker distribuido/WebSocket si se requiere multi-instancia.
3. Agregar documentacion de decisiones tecnicas en ADRs si la entrega lo requiere.

## Notas Finales

Este README esta orientado tanto a uso local como a defensa tecnica del proyecto. Resume la arquitectura actual, las decisiones principales y el estado real de implementacion para que pueda usarse como apoyo en revision de codigo o entrevista tecnica.
