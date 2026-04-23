<h1 align="center">
  <img src="./asset/logo.png" alt="resume-jp" width="600" />
</h1>

`resume-jp` is a Deno-based CLI tool for managing Japanese resume / skill sheet
data in JSON, JSONC, or YAML, and exporting it to HTML or PDF.

It provides a starter template generator, schema validation, a local preview
server, PDF export, and a local helper UI for editing input data.

## Features

- Manage resume data in JSON / JSONC / YAML
- Generate starter files
- Validate input with a schema
- Export to HTML / PDF
- Run a local preview server
- Launch a local helper UI for editing
- Built-in themes:
  - `jp-basic`
  - `jp-modern`

## Repository Structure

```text
packages/
  cli/              CLI entrypoint
  core/             parse / validate / normalize / render
  types/            input data types
  theme-api/        theme API
  theme-jp-common/  shared theme utilities
  theme-jp-basic/   built-in basic theme
  theme-jp-modern/  built-in modern theme
  ui-app/           helper UI (Vue 3 + Vite + Vuetify)
scripts/
  compile.ts        build a bundled binary with the UI
```

## Setup

### Requirements

- Deno
- A Chrome / Chromium executable if you want PDF export

### Initial setup

```bash
deno install
```

## Quick Start

### 1. Generate a starter file

Start with YAML:

```bash
deno task resume -- init --format yaml
```

Start with JSON:

```bash
deno task resume -- init --format json
```

Default output paths:

- `json` → `./resume.json`
- `yaml` → `./resume.yaml`

### 2. Validate the input file

```bash
deno task resume -- validate ./resume.yaml
```

### 3. Start a local preview server

```bash
deno task resume -- preview ./resume.yaml
```

Default URL:

- `http://127.0.0.1:3000`

### 4. Export HTML

```bash
deno task resume -- export ./resume.yaml --format html
```

Default output:

- `./dist/resume.html`

### 5. Export PDF

PDF export requires a Chrome / Chromium executable.

The CLI tries to auto-detect Chrome on your system. If auto-detection does not
work, pass `--browser-path` or set `RESUME_JP_CHROME_PATH`.

```bash
deno task resume -- export ./resume.yaml --format pdf
```

```bash
deno task resume -- export ./resume.yaml --format pdf --browser-path /usr/bin/google-chrome
```

Default output:

- `./dist/resume.pdf`

### 6. Export with the modern theme

```bash
deno task resume -- export ./resume.yaml --format pdf --theme jp-modern
```

## Commands

### `init`

Create a starter file.

```bash
deno task resume -- init --format yaml
deno task resume -- init --format json
deno task resume -- init --format yaml --force
```

Options:

- `-f, --format <json|yaml>`
- `-F, --force`

### `validate`

Validate an input file.

```bash
deno task resume -- validate ./resume.yaml
```

### `export`

Export to HTML or PDF.

```bash
deno task resume -- export ./resume.yaml --format html
deno task resume -- export ./resume.yaml --format pdf
deno task resume -- export ./resume.yaml --format pdf --theme jp-modern
deno task resume -- export ./resume.yaml --format html --out ./dist/custom.html
```

Options:

- `-f, --format <html|pdf>`
- `-o, --out <path>`
- `-t, --theme <theme>`
- `--browser-path <path>`

### `preview`

Start a local preview server.

```bash
deno task resume -- preview ./resume.yaml
deno task resume -- preview ./resume.yaml --port 3001
deno task resume -- preview ./resume.yaml --theme jp-modern
```

Options:

- `-p, --port <number>`
- `-t, --theme <theme>`

### `ui`

Start the local helper UI.

Build the UI first:

```bash
deno task ui:build
deno task resume -- ui ./resume.yaml
```

Default URL:

- `http://127.0.0.1:4310`

Custom port:

```bash
deno task resume -- ui ./resume.yaml --port 4311
```

## UI Development

The UI app also has standalone development tasks.

```bash
deno task ui:dev
deno task ui:build
deno task ui:preview
```

## Built-in Themes

### `jp-basic`

A simple table-based layout for a standard Japanese resume / skill sheet.

### `jp-modern`

A more visual layout using cards and grids.

## Custom Themes

`--theme` accepts not only built-in theme IDs, but also local paths or external
modules.

```bash
deno task resume -- export ./resume.yaml --theme ./themes/my-theme/mod.ts
```

A theme module should export a `ThemeModule` as either `default` or `theme`.

## Supported Input Formats

Supported file extensions:

- `.json`
- `.jsonc`
- `.yaml`
- `.yml`

## Minimal Example

```yaml
profile:
  name:
    familyName: Yamada
    givenName: Taro
    familyNameKana: ヤマダ
    givenNameKana: タロウ
  gender: Male
  nationality: Japan
  nearestStation: Shinagawa
  specialtiesText: |
    - Business system development
    - Frontend implementation
  skillSummary:
    os:
      - name: macOS
        experienceText: 5 years
        level: 上級
    languages:
      - name: TypeScript
        experienceText: 4 years
        level: 上級
    frameworks:
      - name: Vue 3
        experienceText: 3 years
        level: 上級
    databases:
      - name: PostgreSQL
        experienceText: 2 years
        level: 実務経験あり
    others:
      - name: Docker
        experienceText: 2 years
        level: 実務経験あり
  selfPr: |
    I have mainly worked on frontend development,
    covering requirement organization, implementation, and maintenance.
qualifications:
  - name: Fundamental Information Technology Engineer Examination
    acquiredAt: 2020/10
projects:
  - period:
      from: 2023/04
      to: 2024/12
    projectName: Order Management System Renewal
    overview: Responsible for SPA migration and operational improvements.
    role: member
    techStack:
      languages: [TypeScript, HTML, CSS]
      serverOs: [Amazon Linux]
      databases: [PostgreSQL]
      frameworks: [Vue 3, Hono]
      tools: [Docker, GitHub Actions]
      others: [REST API]
    phases:
      requirementAnalysis: false
      requirementsDefinition: true
      basicDesign: true
      detailDesign: true
      implementation: true
      unitTest: true
      integrationTest: true
      systemTest: false
      acceptanceTest: false
      release: true
      operationMaintenance: true
```

## Data Notes

- `role` must be either `メンバー` or `リーダー`
- Supported skill levels:
  - `初級`
  - `中級`
  - `上級`
  - `実務経験あり`
  - `指導可能`

## Implementation Notes

- Initials are generated from the kana name fields
- Total experience is calculated from project periods
- Projects are rendered internally in reverse order, so entering them from
  oldest to newest may produce a more natural display order
- The UI rewrites the input file based on its extension
  - `.jsonc` is currently written back as formatted JSON without preserving
    comments

## Build a Binary

You can build a bundled binary that includes the UI assets.

```bash
deno task compile
```

Custom output path:

```bash
deno task compile -- --output ./dist/resume
```

Example target:

```bash
deno task compile -- --target x86_64-unknown-linux-gnu
```

With self-extracting mode:

```bash
deno task compile -- --self-extracting
```

## Development Tasks

```bash
deno task check
deno task fmt
deno task lint
deno task test
```

## License

MIT License. See [LICENSE](./LICENSE) for details.
