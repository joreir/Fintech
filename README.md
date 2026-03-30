# Sistema de Gestión de Préstamos y Transacciones (FinTech)

Sistema integral para la gestión y simulación de préstamos, así como el seguimiento de transacciones. Permite a los usuarios solicitar y visualizar préstamos (con su respectiva tabla de amortización) y realizar el seguimiento de los pagos y desembolsos asociados.

## Links de Despliegue

- **Frontend (Web App):** [https://fintech-frontend-l98t.onrender.com/](https://fintech-frontend-l98t.onrender.com/)
- **Backend (API Swagger):** [https://fintech-api-sve3.onrender.com/swagger/index.html](https://fintech-api-sve3.onrender.com/swagger/index.html)

---

## Tecnologías Utilizadas

### Stack Principal
- **Backend:** .NET 8 (C#)
- **Frontend:** Next.js 14+ / React 19 (con TypeScript)
- **Base de Datos:** PostgreSQL

### Librerías Clave
- *Backend:* Entity Framework Core (ORM), FluentValidation (Validación de reglas de negocio).
- *Frontend:* Tailwind CSS, Shadcn UI, React Hook Form + Zod (para validación de formularios en cliente), Axios.

---

## Decisiones Técnicas y Arquitectura

### Arquitectura Limpia (Clean Architecture)
El backend está dividido en capas para la separación de responsabilidades:
1. **Core (Domain):** Contiene los modelos de negocio (`Loan`, `Transaction`, `PaymentSchedule`) y las interfaces abstractas. No depende de ninguna tecnología externa, garantizando que la lógica de negocio se mantenga aislada y pura.
2. **Infrastructure:** Contiene la implementación concreta del acceso a datos usando Entity Framework Core, la configuración de la base de datos y la implementación de patrones de persistencia.
3. **API:** Expone los endpoints REST, gestiona los DTOs, la inyección de dependencias y la configuración de Swagger. Utiliza FluentValidation para asegurar que los datos de entrada cumplan los requisitos antes de tocar la capa de negocio.

### Patrones de Diseño Implementados
- **Repository Pattern:** Abstrae la forma en que se accede, se guarda o se elimina la información de la base de datos. Sirve como una capa intermedia que evita acoplar los servicios de negocio directamente a las sentencias de Entity Framework, favoreciendo la mantenibilidad y permitiendo "mockear" la base de datos en las pruebas.
- **Unit of Work Pattern (UoW):** Coordina los cambios realizados por los repositorios. Es vital en escenarios financieros porque asegura atomicidad (Transacciones ACID). Por ejemplo, si se genera un préstamo y luego se deben registrar paralelamente las transacciones del desembolso y un cronograma, el UoW agrupa ambas operaciones. 

---

## Instalación Local y Ejecución

### Prerrequisitos
- .NET 8 SDK
- Node.js 18+
- Base de Datos PostgreSQL 14+ instalada y en ejecución.

### 1. Variables de Entorno

**Frontend:**  
Crea un archivo `.env.local` en la ruta `frontend/` en base al `.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_USER_ID=user_reinaldo_08
```

**Backend:**  
Configura una cadena de conexión a tu DB dentro de `backend/FinTech.API/appsettings.json` o usando Secretos / Variables de entorno:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=FintechDb;Username=Usuario;Password=Contraseña"
  },
  "FRONTEND_URL": "http://localhost:3000"
}
```

### 2. Levantar el Backend

Abre una terminal en la carpeta principal del proyecto:
```bash
cd backend/FinTech.API
# Restaurar dependencias de nuget
dotnet restore
# Aplicar migraciones a la base de datos para generar las tablas
dotnet ef database update --project ../FinTech.Infrastructure
# Ejecutar la API
dotnet run
```
*Se inicializará el servidor Backend y Swagger.*

### 3. Levantar el Frontend

Abre otra pestaña en tu terminal:
```bash
cd frontend
# Instalar bibliotecas y módulos de Node
npm install
# Iniciar el servidor local de desarrollo
npm run dev
```
*El frontend estará listo para usarse desde http://localhost:3000.*

---

## Testing

El proyecto contiene una capa extra destinada a pruebas ("FinTech.Tests"). Puedes cerciorarte del correcto funcionamiento de las reglas de negocio ejecutando:

```bash
cd backend
dotnet test
```

---

## Supuestos y Limitaciones Consideradas

En la versión actual del contexto, el sistema está concebido bajo una serie de condiciones simplificadas para lograr un MVP operativo:
- **Modelo de Préstamos Estandarizado:** Por simplicidad, todos los cálculos se ejecutan bajo el estándar del **Sistema Francés** (cuotas mensuales fijas).
- **Tipos de Transacciones Restringidas:** La naturaleza de las operaciones quedó encuadrada puntualmente en **Desembolso** de préstamos y **Pago** de cuotas, evadiendo cobros extra como cargos de mora o re-financiación en esta etapa.
- **Single-User Emulado:** Como no se priorizó la logística de Auth para la entrega, la consulta general de cara al uso interactivo simula un estado de inicio de sesión hardcodeado contra un alias genérico (manejado vía variable de entorno temporal `NEXT_PUBLIC_USER_ID`).

---

## Mejoras Futuras Visualizadas

Las bases que cimentan esta plataforma permiten escalar ágilmente hacia iteraciones posteriores de mayor categoría:
- **Autenticación, Autorización y Roles (Login real):** Integrar flujos de identidad sólidos como JWT, IdentityServer o Auth0 para que convivan dinámicamente varios usuarios reales dueños de distintas cuentas y administradores.
- **Paginación Robusta:** Incorporar estrategias de paginación tanto en Frontend como en la API para optimizar tiempos de carga cuando el histórico transaccional crezca en volumen.
- **Sistemas de Préstamo Variados:** Incorporar amortización mediante Sistema Alemán, Americano o pagos de periodos customizados.
- **Flujos CI/CD:** Añadir GitHub Actions para ejecutar las pruebas automáticas y realizar despliegues automáticos a Render en ramas específicas.