# DataHealth

Piattaforma per il **caricamento, pulizia, standardizzazione, archiviazione e
condivisione di dati clinici, genomici/molecolari, di imaging e di sample**.

> Stato attuale: **prototipo di front-end** (UI) esportato da Figma Make e
> messo in produzione su Vercel. Nessun backend collegato per ora — i dati
> mostrati sono mock a scopo dimostrativo.

## Stack tecnico

- **Vite 6** + **React 18** + **TypeScript**
- **Tailwind CSS v4** + componenti **shadcn/ui** (Radix UI) e **MUI**
- **Recharts** per i grafici, **lucide-react** / **@carbon/icons-react** per le icone
- Package manager: **pnpm**

## Avvio in locale

Prerequisiti: Node.js 22+ e pnpm (`corepack enable` oppure `npm i -g pnpm`).

```bash
pnpm install      # installa le dipendenze
pnpm dev          # avvia il server di sviluppo (http://localhost:5173)
pnpm build        # build di produzione in dist/
pnpm preview      # anteprima locale della build di produzione
```

## Deploy

Il deploy è automatico su **Vercel**:

- ogni push sul branch **`main`** pubblica in **produzione**;
- ogni push su un altro branch / Pull Request genera un **Preview Deploy** con
  URL dedicato per la revisione.

Configurazione build in [vercel.json](vercel.json).

## Struttura del progetto

```
src/
  main.tsx                 # entry point React
  app/
    App.tsx                # shell dell'app + navigazione tra le sezioni
    components/
      ui/                  # componenti base (shadcn/ui, Radix)
      dm/                  # Data Manager (progetti, entità, variabili, lab, biobank)
      audit/               # log operazioni, accessi, alert di sicurezza
      um/                  # gestione utenti e ruoli/permessi
      settings/            # configurazioni, standard dati, API key, profilo
      ...                  # Dashboard, Query Tool, Connectors, FileUploader, ...
  styles/                  # Tailwind + temi
  assets/                  # immagini
```

## Workflow di team

1. Crea un branch dalla `main` (es. `feature/nome-funzione`).
2. Sviluppa, fai commit e apri una **Pull Request**.
3. Vercel genera un Preview da revisionare.
4. Dopo l'approvazione, fai merge su `main` → deploy automatico in produzione.

## Licenze / attribuzioni

Vedi [ATTRIBUTIONS.md](ATTRIBUTIONS.md).
