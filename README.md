# Cash Operations System

React + TypeScript + Vite project.

## Folder Architecture

```
src/
├── app/              # Aplicación principal (App.tsx entry)
├── domain/           # Domain layer
│   ├── entities/     # Entidades de negocio (Branch, Session, Transaction, etc.)
│   ├── value-objects/ # Objetos valor inmutables
│   └── services/    # Servicios de dominio
├── features/         # Features módulos (feature-sliced design)
├── infrastructure/   #Capa de infraestructura
│   ├── db/         # Configuración de base de datos (Dexie)
│   └── repositories/ # Implementaciones de repositorios
├── routes/          # Configuración de rutas (@tanstack/react-router)
├── shared/          # Código compartido
│   ├── ui/         # Componentes UI reutilizables (shadcn)
│   ├── hooks/      # Custom hooks
│   └── utils/      # Utilidades helpers
├── stores/          # Estado global (Zustand stores)
├── i18n/           # Configuración de internacionalización
└── tests/          # Tests y utilities de testing
```

## Folder Purposes

| Folder | Purpose |
|--------|---------|
| `app/` | Punto de entrada de la aplicación |
| `domain/entities/` | Entidades del negocio: Branch, Session, Transaction, Movement |
| `domain/value-objects/` | Objetos valor inmutables (Money, DateRange) |
| `domain/services/` | Lógica de negocio pura |
| `features/` | Módodos por feature (auth, branches, reports) |
| `shared/ui/` | Componentes UI genéricos (Button, Input, Card) |
| `shared/hooks/` | Hooks reutilizables (useLocalStorage, useDebounce) |
| `shared/utils/` | Funciones helpers (formatCurrency, formatDate) |
| `infrastructure/db/` | Configuración Dexie y schemas |
| `infrastructure/repositories/` | Data access implementations |
| `stores/` | Zustand stores (branchStore, sessionStore) |
| `routes/` | Router configuration |
| `i18n/` | i18next config y traducciones |
| `tests/` | Test utilities y mocks |

## Local

```bash
pnpm install
pnpm dev
```

## Docker

```bash
docker compose up
```