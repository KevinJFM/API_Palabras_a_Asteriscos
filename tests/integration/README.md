# Integration Tests

Este directorio contiene pruebas de integración para la API de palabras en asteriscos con integración MySQL.

## Estructura

- `palabras.test.js`: Pruebas para los flujos completos de la API
- `database-errors.test.js`: Pruebas para el manejo de errores de conexión a la base de datos
- `edge-cases.test.js`: Pruebas para casos límite y escenarios de error
- `performance.test.js`: Pruebas de rendimiento y concurrencia
- `mysql-transactions.test.js`: Pruebas específicas para transacciones MySQL
- `setup.js`: Configuración de la base de datos de prueba
- `test-env.js`: Configuración del entorno de prueba

## Requisitos

Para ejecutar estas pruebas, necesitas:

1. MySQL instalado y en ejecución
2. Variables de entorno configuradas (o valores por defecto en `setup.js`)
3. Permisos para crear y eliminar bases de datos en MySQL

## Ejecución

Para ejecutar las pruebas de integración:

```bash
npm run test:integration
```

Este comando ejecutará todas las pruebas de integración en serie (--runInBand) para evitar conflictos con la base de datos.

## Cobertura de Requisitos

Estas pruebas cubren los siguientes requisitos del proyecto:

### Requirement 4.1
> WHEN se realiza cualquier operación con la base de datos THEN el sistema SHALL manejar adecuadamente los errores de conexión.

Cubierto por:
- `database-errors.test.js`: Simula errores de conexión a la base de datos y verifica que la API los maneje correctamente.

### Requirement 4.2
> WHEN se realizan consultas a la base de datos THEN el sistema SHALL utilizar consultas parametrizadas para prevenir inyecciones SQL.

Cubierto por:
- `edge-cases.test.js`: Prueba palabras con intentos de inyección SQL para verificar que se manejen de forma segura.

## Flujos Completos

Las pruebas de integración verifican los siguientes flujos completos:

1. Creación de palabras y su representación en asteriscos
2. Recuperación de palabras por ID
3. Listado de palabras con paginación
4. Búsqueda de palabras por texto
5. Operaciones administrativas (eliminar, actualizar, estadísticas)
6. Manejo de errores y casos límite

## Casos de Error

Se prueban los siguientes casos de error:

1. Entradas inválidas (palabras vacías, IDs no numéricos)
2. Recursos no encontrados (palabras que no existen)
3. Errores de conexión a la base de datos
4. Palabras demasiado largas
5. Caracteres especiales y posibles inyecciones SQL
6. Concurrencia y condiciones de carrera