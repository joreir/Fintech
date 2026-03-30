# Sistema de Gestión de préstamos y transacciones

Sistema para la gestión de préstamos e transacciones. Permite simular, visualizar préstamos y visualizar transacciones .



## Links de despliegue

Frontend: https://tu-frontend-url.com  
Backend (Swagger): https://tu-backend-url.com/swagger  

Usuario: test@example.com  


## Tecnologías utilizadas

### Stack del proyecto
- Backend: .NET 8 
- Frontend: Next.js / React
- Base de datos: PostgreSQL

### Librerías principales
- Entity Framework Core
- FluentValidation
- React Hook Form + Zod

### Decisiones técnicas importantes
- Uso de arquitectura en capas (Core,Infrastructure, API)
- Implementación del patrón Repository para abstracción del acceso a datos( explicar tambien el unit of work )
- Separación de la lógica de negocio respecto a la infraestructura
- Validaciones desacopladas mediante FluentValidation


## Instalación local

### Prerrequisitos
- .NET 8 SDK
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd FinTech.API
dotnet restore
dotnet ef database update
dotnet run

## Variables de entorno



## Testing

## Arquitectura
Breve explicación de la estructura
Patrones implementados (con justificación)
Diagrama simple (opcional pero valorado)
##Decisiones de diseño
¿Por qué elegiste X librería?
¿Qué trade-offs hiciste?
¿Qué simplificaste y por qué?
##Supuestos y limitaciones
Funcionalidades no implementadas
Simplificaciones realizadas
Mejoras futuras