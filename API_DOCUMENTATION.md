# API de Palabras en Asteriscos - Documentación

Esta documentación describe los endpoints disponibles en la API de Palabras en Asteriscos, que permite procesar palabras para convertirlas en representaciones de asteriscos, almacenarlas en una base de datos MySQL y realizar operaciones sobre ellas.

## Base URL

```
/api
```

## Endpoints Públicos

### Procesar Palabra

Convierte una palabra en su representación en asteriscos y la almacena en la base de datos.

- **URL**: `/api/palabra`
- **Método**: `POST`
- **Autenticación**: No requerida

**Parámetros de Entrada (JSON)**:
```json
{
  "palabra": "string" // La palabra a procesar (requerido)
}
```

**Respuesta Exitosa**:
- **Código**: 200 OK
- **Contenido**:
```json
{
  "id": 1,           // Identificador único de la palabra
  "palabra": "HOLA", // La palabra original
  "resultado": "...", // Representación en asteriscos (texto multilinea)
  "contador_uso": 1   // Número de veces que se ha procesado esta palabra
}
```

**Respuestas de Error**:
- **Código**: 400 Bad Request
  - **Contenido**: `{ "error": "Se requiere una palabra" }`
- **Código**: 500 Internal Server Error
  - **Contenido**: `{ "error": "Error al procesar la palabra" }`

**Ejemplo de Uso**:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"palabra":"HOLA"}' http://localhost:3000/api/palabra
```

### Obtener Palabra por ID

Recupera una palabra y su representación en asteriscos por su ID.

- **URL**: `/api/palabra/:id`
- **Método**: `GET`
- **Autenticación**: No requerida

**Parámetros de URL**:
- `id` - ID de la palabra a recuperar

**Respuesta Exitosa**:
- **Código**: 200 OK
- **Contenido**:
```json
{
  "id": 1,
  "palabra": "HOLA",
  "representacion": "...", // Representación en asteriscos (texto multilinea)
  "contador_uso": 2,
  "fecha_creacion": "2025-07-19T12:00:00.000Z",
  "ultima_consulta": "2025-07-19T12:30:00.000Z"
}
```

**Respuestas de Error**:
- **Código**: 400 Bad Request
  - **Contenido**: `{ "error": "Se requiere un ID válido" }`
- **Código**: 404 Not Found
  - **Contenido**: `{ "error": "No se encontró la palabra con ID 1" }`
- **Código**: 500 Internal Server Error
  - **Contenido**: `{ "error": "Error al obtener la palabra" }`

**Ejemplo de Uso**:
```bash
curl http://localhost:3000/api/palabra/1
```

### Listar Palabras

Recupera una lista paginada de todas las palabras almacenadas.

- **URL**: `/api/palabras`
- **Método**: `GET`
- **Autenticación**: No requerida

**Parámetros de Query**:
- `pagina` - Número de página (opcional, por defecto: 1)
- `limite` - Número de elementos por página (opcional, por defecto: 10)

**Respuesta Exitosa**:
- **Código**: 200 OK
- **Contenido**:
```json
{
  "palabras": [
    {
      "id": 1,
      "palabra": "HOLA",
      "representacion": "...",
      "contador_uso": 2,
      "fecha_creacion": "2025-07-19T12:00:00.000Z",
      "ultima_consulta": "2025-07-19T12:30:00.000Z"
    },
    // ... más palabras
  ],
  "total": 25,
  "pagina_actual": 1,
  "total_paginas": 3,
  "limite": 10
}
```

**Respuestas de Error**:
- **Código**: 500 Internal Server Error
  - **Contenido**: `{ "error": "Error al listar las palabras" }`

**Ejemplo de Uso**:
```bash
curl http://localhost:3000/api/palabras?pagina=1&limite=20
```

### Buscar Palabras

Busca palabras que coincidan con un texto específico.

- **URL**: `/api/palabras/buscar`
- **Método**: `GET`
- **Autenticación**: No requerida

**Parámetros de Query**:
- `texto` - Texto a buscar (requerido)
- `pagina` - Número de página (opcional, por defecto: 1)
- `limite` - Número de elementos por página (opcional, por defecto: 10)

**Respuesta Exitosa**:
- **Código**: 200 OK
- **Contenido**:
```json
{
  "palabras": [
    {
      "id": 1,
      "palabra": "HOLA",
      "representacion": "...",
      "contador_uso": 2,
      "fecha_creacion": "2025-07-19T12:00:00.000Z",
      "ultima_consulta": "2025-07-19T12:30:00.000Z"
    },
    // ... más palabras que coinciden con la búsqueda
  ],
  "total": 5,
  "pagina_actual": 1,
  "total_paginas": 1,
  "limite": 10
}
```

**Respuestas de Error**:
- **Código**: 500 Internal Server Error
  - **Contenido**: `{ "error": "Error al buscar palabras" }`

**Ejemplo de Uso**:
```bash
curl http://localhost:3000/api/palabras/buscar?texto=HOL&pagina=1&limite=10
```

## Endpoints Administrativos

> **Nota**: Todos los endpoints administrativos requieren autenticación.

### Eliminar Palabra

Elimina una palabra de la base de datos.

- **URL**: `/api/admin/palabra/:id`
- **Método**: `DELETE`
- **Autenticación**: Requerida

**Parámetros de URL**:
- `id` - ID de la palabra a eliminar

**Respuesta Exitosa**:
- **Código**: 200 OK
- **Contenido**:
```json
{
  "mensaje": "Palabra con ID 1 eliminada correctamente"
}
```

**Respuestas de Error**:
- **Código**: 400 Bad Request
  - **Contenido**: `{ "error": "Se requiere un ID válido" }`
- **Código**: 401 Unauthorized
  - **Contenido**: `{ "error": "No autorizado" }`
- **Código**: 404 Not Found
  - **Contenido**: `{ "error": "No se pudo eliminar la palabra con ID 1" }`
- **Código**: 500 Internal Server Error
  - **Contenido**: `{ "error": "Error al eliminar la palabra" }`

**Ejemplo de Uso**:
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/admin/palabra/1
```

### Actualizar Palabra

Actualiza una palabra existente en la base de datos.

- **URL**: `/api/admin/palabra/:id`
- **Método**: `PUT`
- **Autenticación**: Requerida

**Parámetros de URL**:
- `id` - ID de la palabra a actualizar

**Parámetros de Entrada (JSON)**:
```json
{
  "palabra": "string" // Nueva palabra (opcional)
  // Otros campos que se pueden actualizar
}
```

**Respuesta Exitosa (cuando se actualiza la palabra)**:
- **Código**: 200 OK
- **Contenido**:
```json
{
  "id": 1,
  "palabra": "ADIOS",
  "resultado": "...", // Nueva representación en asteriscos
  "contador_uso": 2
}
```

**Respuesta Exitosa (cuando se actualizan otros campos)**:
- **Código**: 200 OK
- **Contenido**:
```json
{
  "id": 1,
  "palabra": "HOLA",
  "representacion": "...",
  "contador_uso": 3,
  "fecha_creacion": "2025-07-19T12:00:00.000Z",
  "ultima_consulta": "2025-07-19T13:00:00.000Z"
}
```

**Respuestas de Error**:
- **Código**: 400 Bad Request
  - **Contenido**: `{ "error": "Se requiere un ID válido" }` o `{ "error": "Se requieren datos para actualizar" }`
- **Código**: 401 Unauthorized
  - **Contenido**: `{ "error": "No autorizado" }`
- **Código**: 404 Not Found
  - **Contenido**: `{ "error": "No se encontró la palabra con ID 1" }`
- **Código**: 500 Internal Server Error
  - **Contenido**: `{ "error": "Error al actualizar la palabra" }`

**Ejemplo de Uso**:
```bash
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"palabra":"ADIOS"}' http://localhost:3000/api/admin/palabra/1
```

### Obtener Estadísticas

Obtiene estadísticas de uso de las palabras.

- **URL**: `/api/admin/estadisticas`
- **Método**: `GET`
- **Autenticación**: Requerida

**Respuesta Exitosa**:
- **Código**: 200 OK
- **Contenido**:
```json
{
  "total_palabras": 25,
  "palabras_mas_usadas": [
    {
      "id": 1,
      "palabra": "HOLA",
      "contador_uso": 10
    },
    {
      "id": 5,
      "palabra": "ADIOS",
      "contador_uso": 8
    },
    // ... más palabras ordenadas por contador_uso
  ],
  "promedio_uso": 5.2,
  "ultima_palabra_agregada": {
    "id": 25,
    "palabra": "EJEMPLO",
    "fecha_creacion": "2025-07-19T14:00:00.000Z"
  }
}
```

**Respuestas de Error**:
- **Código**: 401 Unauthorized
  - **Contenido**: `{ "error": "No autorizado" }`
- **Código**: 500 Internal Server Error
  - **Contenido**: `{ "error": "Error al obtener estadísticas" }`

**Ejemplo de Uso**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/admin/estadisticas
```

## Autenticación

Para acceder a los endpoints administrativos, se requiere autenticación mediante un token JWT.

**Encabezado de Autenticación**:
```
Authorization: Bearer YOUR_TOKEN
```

> **Nota**: La documentación no incluye el endpoint para obtener el token de autenticación, ya que no está implementado en el código proporcionado. Se asume que existe un mecanismo externo para obtener el token.

## Códigos de Estado

- `200 OK`: La solicitud se ha completado correctamente
- `400 Bad Request`: La solicitud contiene parámetros inválidos o faltantes
- `401 Unauthorized`: No se proporcionó un token válido para acceder a un recurso protegido
- `404 Not Found`: El recurso solicitado no existe
- `500 Internal Server Error`: Error en el servidor al procesar la solicitud