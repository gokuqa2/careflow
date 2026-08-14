# CareFlow

## Project Overview

CareFlow is a healthcare-inspired care coordination platform built as a senior React Native engineering showcase. It helps operational and clinical teams see high-priority cases, review patients, manage care-related tasks, and update task status. It uses entirely fictional data and is not connected to any real patient records or EHR system.

---

## Problem

Clinical and operational teams manage dozens of concurrent patient cases with no unified view of priorities, pending tasks, or overdue items. CareFlow provides a lightweight, real-time care queue that makes high-priority work visible and actionable.

---

## Architecture

```
React Native (Expo)  ────┐
                         │  HTTPS / REST
React Web (Vite)    ─────┤
                         ▼
               ASP.NET Core 8 API
                         │
                         ├── Azure SQL (prod)
                         │   SQLite (local dev)
                         │
                         └── Application Insights
```

---

## Technology Choices

| Layer | Technology | Reason |
|---|---|---|
| Mobile | React Native + Expo | Cross-platform, fast iteration, native feel |
| State | Redux Toolkit | Predictable state, clean selectors, interview-visible architecture |
| Navigation | React Navigation | Industry standard for RN navigation |
| Persistence | AsyncStorage | Offline task completion state |
| Web | React + Vite | Lightweight ops dashboard, fast builds |
| API | ASP.NET Core 8 | Required by role; strong DI and EF Core support |
| ORM | Entity Framework Core | Code-first schema, Azure SQL compatible |
| DB (local) | SQLite | Zero-config local development |
| DB (prod) | Azure SQL | Required by role; enterprise relational database |
| Observability | Application Insights | SDK-level telemetry, zero custom infrastructure |
| HTTP Client | Axios | Consistent request/response handling, configurable timeouts |

---

## React Native Engineering Notes

Beyond the app-level architecture, a few RN-specific practices worth pointing out:

- **Safe area handling** — `SafeAreaProvider` wraps the app root; each screen reads `useSafeAreaInsets()` instead of hardcoding padding, so content clears the notch/home indicator on any device.
- **List performance** — `TaskCard` is wrapped in `React.memo`. `CareQueueScreen` passes it a single stable `onPress` callback via `useCallback` (bound to patient id, not per-item closures) and memoizes `renderItem` — so completing one task doesn't re-render every row in the list.
- **Platform-specific styling** — shadows use `Platform.select`: iOS reads `shadowColor`/`shadowOpacity`/`shadowRadius`, Android reads `elevation`. Mixing both unconditionally works but is redundant; `Platform.select` makes the platform difference explicit in the code.
- **Component testing** — `@testing-library/react-native` renders real RN components (not just Redux logic) and asserts on interaction (`fireEvent.press`), not implementation details.
- **Native build pipeline** — `apps/mobile/eas.json` defines EAS Build profiles (dev/preview/production) with per-profile API targets, documented in [Native Build & Distribution](#native-build--distribution-eas).

---

## Repository Structure

```
careflow/
├── apps/
│   ├── mobile/         # React Native / Expo
│   ├── web/            # React / Vite operations dashboard
│   ├── api/            # ASP.NET Core 8 C# API
│   └── api.tests/      # xUnit test suite for the API
├── docs/
│   └── architecture.md
└── README.md
```

---

## Local Development

### Prerequisites

- Node.js 18+
- .NET 8 SDK
- Expo CLI (`npm install -g expo-cli`)

### 1 — Start the API

```bash
cd apps/api
dotnet run --urls "http://localhost:5000"
```

The API uses SQLite automatically when no `ConnectionStrings:DefaultConnection` is set.

Swagger UI: http://localhost:5000/swagger  
Health check: http://localhost:5000/api/health

### 2 — Start the mobile app

```bash
cd apps/mobile
npm install
npx expo start
```

Press `w` for web, `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

The API URL is configured in `app.json → extra.apiUrl`. Change it to point to your Azure deployment.

### 3 — Start the web app

```bash
cd apps/web
npm install
npm start        # Vite dev server at http://localhost:3000
```

The Vite dev server proxies `/api` to `http://localhost:5000`.  
Set `VITE_API_URL` to point to Azure in production builds.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/patients` | List all patients |
| GET | `/api/patients/{id}` | Patient detail + tasks |
| GET | `/api/care-tasks` | All care tasks |
| PATCH | `/api/care-tasks/{id}` | Update task status |

Live Swagger UI: https://careflow-api-sofclj.azurewebsites.net/swagger

---

## Azure Deployment

**Live deployment (Central US region):**

| Resource | Name |
|---|---|
| Resource Group | `careflow-rg` |
| App Service Plan | `careflow-plan` (Linux, F1 Free) |
| App Service (API) | `careflow-api-sofclj` → https://careflow-api-sofclj.azurewebsites.net |
| Azure SQL Server | `careflow-sql-sofclj` |
| Azure SQL Database | `careflow-db` (Serverless, General Purpose, auto-pause after 60 min idle) |
| Application Insights | `careflow-insights` |

> Note: the trial subscription only had VM quota available in `centralus` (not `eastus`). If you hit `Operation cannot be completed without additional quota`, try a different region — `centralus`, in particular, tends to have quota available for new/trial subscriptions.

### Steps performed

```bash
# Resource group
az group create --name careflow-rg --location centralus

# App Service Plan (Linux, Free tier)
az appservice plan create --name careflow-plan --resource-group careflow-rg --location centralus --is-linux --sku F1

# Web App (.NET 8)
az webapp create --name careflow-api-sofclj --resource-group careflow-rg --plan careflow-plan --runtime "DOTNETCORE:8.0"

# Azure SQL Server + Database (serverless, auto-pause)
az sql server create --name careflow-sql-sofclj --resource-group careflow-rg --location centralus --admin-user careflowadmin --admin-password "<password>"
az sql db create --resource-group careflow-rg --server careflow-sql-sofclj --name careflow-db --edition GeneralPurpose --family Gen5 --capacity 1 --compute-model Serverless --auto-pause-delay 60
az sql server firewall-rule create --resource-group careflow-rg --server careflow-sql-sofclj --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

# Application Insights
az monitor app-insights component create --app careflow-insights --location centralus --resource-group careflow-rg

# Configure App Settings (connection string + telemetry — never committed to source)
az webapp config appsettings set --resource-group careflow-rg --name careflow-api-sofclj --settings \
  "ConnectionStrings__DefaultConnection=<sql-connection-string>" \
  "ApplicationInsights__ConnectionString=<app-insights-connection-string>" \
  "ASPNETCORE_ENVIRONMENT=Production"

# Publish targeting linux-x64 (avoids bundling native binaries for every platform)
cd apps/api
dotnet publish -c Release -r linux-x64 --self-contained false -o ./publish
Compress-Archive -Path ./publish/* -DestinationPath deploy.zip -Force
az webapp deploy --resource-group careflow-rg --name careflow-api-sofclj --src-path deploy.zip --type zip
```

**Known deployment gotcha:** publishing without `-r linux-x64` bundles native SQLite binaries for every OS/architecture (win, osx, wasm, etc.), and Windows' `Compress-Archive` produces backslash-separated paths for those nested folders that break `rsync` on the Linux App Service host. Always publish with an explicit `-r linux-x64 --self-contained false` for Linux App Service deployments.

### Mobile → Azure API

`apps/mobile/app.json` is already configured to call the live Azure API:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://careflow-api-sofclj.azurewebsites.net"
    }
  }
}
```

To switch back to local development, change this back to `http://localhost:5000`.

### Web → Azure API

`apps/web/.env.production` sets the Azure URL for production builds:

```
VITE_API_URL=https://careflow-api-sofclj.azurewebsites.net
```

```bash
cd apps/web
npm run build      # picks up .env.production automatically
npm run preview    # serve the build locally to verify
```

---

## Native Build & Distribution (EAS)

`apps/mobile/eas.json` configures three build profiles for [Expo Application Services](https://expo.dev/eas):

| Profile | Distribution | API target |
|---|---|---|
| `development` | Internal (dev client) | `localhost:5000` |
| `preview` | Internal (ad-hoc / TestFlight internal) | Azure |
| `production` | App Store / Play Store | Azure |

```bash
cd apps/mobile
eas build --profile preview --platform android   # unsigned internal build
eas build --profile production --platform all     # store-ready build
eas submit --profile production --platform ios    # submit to App Store Connect
```

This was not executed for this project (no Apple/Google developer account provisioned), but the configuration demonstrates the intended pipeline: native builds are produced in Expo's cloud infra, not on a developer's machine, and each profile injects a different API target through environment variables — no hardcoded URLs in the binary.

---

## Testing

### Mobile — Jest + React Native Testing Library

```bash
cd apps/mobile
npm test
```

17 tests total:
- **Redux logic** (9) — reducer state transitions, task completion behavior, selector derivations (urgent count, pending count, today's priorities)
- **Component rendering & interaction** (8) — `PriorityBadge`, `EmptyState`, and `TaskCard` rendered with `@testing-library/react-native`, including a `fireEvent.press` test asserting `TaskCard` calls `onPress` with the correct patient id

### API — xUnit tests

```bash
cd apps/api.tests
dotnet test
```

Tests cover (15 total):
- `CareService` business logic against a fake `ICareDataProvider` (no database needed)
- Patient lookup — found and not-found paths
- Task status update — success, invalid status (400), task not found (404)
- Controller HTTP status codes for all four endpoints, including `HealthController`

All endpoints also manually verified via Swagger at `/swagger` and PowerShell `Invoke-RestMethod`, both locally and against the live Azure deployment.

---

## AI-Assisted Development

This project was scaffolded and developed with GitHub Copilot as an active pair.

AI was used for:
- Project scaffolding and file generation
- Code review and edge-case identification
- Test generation for Redux reducers and selectors
- Refactoring suggestions and documentation

> AI accelerates implementation and exploration, but the engineer remains responsible for architecture, validation, security, testing, and final decisions. Every file in this repository was reviewed, understood, and approved by the developer before use.

---

## Epic / EHR Architecture

The API defines `ICareDataProvider` with a single implementation: `EfCoreCareDataProvider` (EF Core / Azure SQL).

A future `EpicCareDataProvider` would implement the same interface and communicate with an Epic FHIR R4 endpoint using SMART on FHIR OAuth2. The mobile and web applications would require zero changes.

```
ICareDataProvider
    ├── EfCoreCareDataProvider   ← current
    └── EpicCareDataProvider     ← future (FHIR R4, SMART on FHIR)
```

---

## Security

**Implemented:**
- No secrets committed to source control
- Environment variables / Azure App Settings for all credentials
- HTTPS enforced on Azure App Service
- Global exception handler prevents stack traces reaching clients

**Required for production healthcare:**
- Microsoft Entra ID (Azure AD) authentication
- Role-based authorization (clinician vs. admin)
- Azure Key Vault for secrets rotation
- HTTPS-only with HSTS
- Audit logging of all PHI access
- HIPAA Business Associate Agreement with Azure
- Data encryption at rest and in transit

---

## Future Production Architecture

These are **not implemented**. They represent a real production roadmap.

| Concern | Approach |
|---|---|
| Authentication | Microsoft Entra ID (MSAL) + JWT bearer |
| Authorization | Role-based: Clinician, Coordinator, Admin |
| Secrets | Azure Key Vault + Managed Identity |
| API Versioning | URL versioning `/api/v1/...` |
| Pagination | Cursor-based for large care queues |
| Caching | Redis Cache for patient lists |
| Retries | Polly for API resilience |
| CI/CD | GitHub Actions → Azure App Service slots |
| EHR Integration | Epic FHIR R4 via `EpicCareDataProvider` |
| CRM Integration | Dynamics 365 / Salesforce Health Cloud via adapter |
| Observability | Application Insights + distributed tracing |
| Scaling | Azure App Service auto-scale rules |
