# CareFlow Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│                                                             │
│  ┌──────────────────┐        ┌──────────────────────┐       │
│  │  React Native    │        │     React Web        │       │
│  │  (Expo)          │        │     (Vite)           │       │
│  │                  │        │                      │       │
│  │  Redux Toolkit   │        │  Local useState()    │       │
│  │  AsyncStorage    │        │  (no Redux needed)   │       │
│  └────────┬─────────┘        └──────────┬───────────┘       │
└───────────┼──────────────────────────────┼───────────────────┘
            │  HTTPS / REST                │
            └──────────────┬───────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               ASP.NET Core 8 API                            │
│                                                             │
│  Controllers (thin)  →  CareService  →  ICareDataProvider   │
│  DTOs                                                       │
│  Global exception middleware                                │
│  Swagger / OpenAPI                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
  ┌───────────────────┐     ┌───────────────────────┐
  │  SQLite (local)   │     │  Azure SQL (prod)      │
  │  Zero config      │     │  Azure App Service     │
  └───────────────────┘     └───────────────────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │  Application Insights  │
                            │  Request telemetry     │
                            │  Exception tracking    │
                            └───────────────────────┘
```

## Data Model

```
Patient
  id              GUID (PK)
  name            string
  dateOfBirth     string
  priority        enum: low | medium | high
  assignedProvider string

CareTask
  id              GUID (PK)
  patientId       GUID (FK → Patient)
  title           string
  priority        enum: low | medium | high
  status          enum: pending | completed
  dueDate         datetime
  notes           string?
```

## ICareDataProvider (EHR abstraction)

```
ICareDataProvider
  GetPatientsAsync()
  GetPatientByIdAsync(id)
  GetCareTasksAsync()
  GetCareTaskByIdAsync(id)
  UpdateCareTaskAsync(task)

EfCoreCareDataProvider    ← current implementation
EpicCareDataProvider      ← future: FHIR R4 / SMART on FHIR
```

## Redux State Shape (mobile)

```typescript
interface CareState {
  patients: Patient[];
  tasks: CareTask[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
```

## Key Decisions

- **SQLite locally, Azure SQL in production** — developers can run the full stack without any cloud account
- **ICareDataProvider abstraction** — EHR systems (Epic, Cerner) can be introduced without touching controllers or services
- **Enums stored as strings** — SQL is human-readable without lookup tables
- **Redux only for shared global state** — transient UI state stays local to components
- **No authentication** — documented as a future production requirement, not added for demo scope
