# TEMPLATE.md

```md
# NestJS API Template (Bearer-secured + Trace-ID + JSON Envelope)

## Contract (all endpoints)
- Path prefix: `/api/...`
- Security: `Bearer <token>` required (verified by `BearerTokenGuard`)
- Trace: every request/response has a UUID `traceId`
  - Incoming accepted via `x-trace-id` (or generated)
  - Always returned in header `x-trace-id` and in JSON body `traceId` (global interceptor)
- Response shape (standard envelope):
  ```json
  {
    "statusCode": 200,
    "errors": [],
    "latency": 123,
    "size": 456,
    "data": {},
    "traceId": "uuid..."
  }
```

## 0) Prereqs

- `.env` must include:
    
    ```
    API_BEARER_TOKEN=replace_me
    ```
    
- App loads `.env` via `@nestjs/config`:
    
    - `ConfigModule.forRoot({ isGlobal: true })`
        

## 1) Platform layer (DO ONCE)

### A) Auth Guard

File: `src/auth/bearer-token.guard.ts`

- Reads `process.env.API_BEARER_TOKEN`
    
- Rejects missing/invalid `Authorization: Bearer ...`
    

### B) Trace-ID

Files:

- `src/common/trace-id.middleware.ts`
    
- `src/common/trace-id.interceptor.ts`
    

Middleware:

- If request has `x-trace-id`, validate UUID; else generate UUID
    
- Attach to `req.traceId`
    
- Set response header `x-trace-id`
    

Interceptor:

- Inject `traceId` into JSON bodies
    
- If handler returns array/primitive, wrap:
    
    ```json
    { "traceId": "...", "data": [...] }
    ```
    

### C) AppModule wiring

- Apply middleware for `*`
    
- Register interceptor globally via `APP_INTERCEPTOR`
    
- Import feature modules in `AppModule`
    

### D) Validation (recommended)

In `main.ts`, add:

- `ValidationPipe({ whitelist: true, transform: true })`
    

## 2) Feature module pattern (FOR EVERY NEW API)

Folder layout:

```
src/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  dto/
    <feature>.dto.ts
```

### Controller rules

- Put `@Controller('api/<feature>')`
    
- Put `@UseGuards(BearerTokenGuard)` at controller level
    
- Do NOT use `@Res()` unless streaming/binary
    
- Return standard envelope:
    
    - `statusCode`, `errors`, `latency`, `size?`, `data`
        
- Never throw raw errors to clients. Prefer envelope with `errors[]`.
    

### Internal calls

If calling another local endpoint:

- Forward `Authorization`
    
- Forward `x-trace-id`  
    Use helper: `forwardAuthAndTrace(req)`.
    

## 3) Copy/paste skeleton

### `<feature>.controller.ts` skeleton

```ts
@Controller('api/<feature>')
@UseGuards(BearerTokenGuard)
export class <Feature>Controller {
  constructor(private readonly svc: <Feature>Service) {}

  @Get()
  async handler(@Query() q: <Feature>QueryDto): Promise<ApiResponse<any>> {
    const started = Date.now();
    try {
      const data = await this.svc.run(q);
      return { statusCode: 200, errors: [], latency: Date.now() - started, data };
    } catch (e: any) {
      return { statusCode: 500, errors: [String(e?.message ?? e)], latency: Date.now() - started, data: null };
    }
  }
}
```

## 4) Postman defaults

- Authorization: Bearer Token = `{{API_BEARER_TOKEN}}`
    
- Optional header: `x-trace-id: {{$guid}}`
    

```

---

# Stub generator layout

## 1) Add these two folders

```

scripts/  
gen-api.ts  
templates/  
api-feature/  
feature.module.ts.tpl  
feature.controller.ts.tpl  
feature.service.ts.tpl  
dto/feature.dto.ts.tpl

````

---

## 2) Templates

### `templates/api-feature/feature.module.ts.tpl`
```ts
import { Module } from '@nestjs/common';
import { __FeaturePascal__Controller } from './__featureKebab__.controller';
import { __FeaturePascal__Service } from './__featureKebab__.service';

@Module({
  controllers: [__FeaturePascal__Controller],
  providers: [__FeaturePascal__Service],
  exports: [__FeaturePascal__Service],
})
export class __FeaturePascal__Module {}
````

### `templates/api-feature/feature.controller.ts.tpl`

```ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { __FeaturePascal__Service } from './__featureKebab__.service';
import { __FeaturePascal__QueryDto } from './dto/__featureKebab__.dto';

type ApiResponse<T> = {
  statusCode: number;
  errors: string[];
  latency: number;
  size?: number;
  data: T;
  // traceId injected by interceptor
};

@Controller('api/__featureKebab__')
@UseGuards(BearerTokenGuard)
export class __FeaturePascal__Controller {
  constructor(private readonly svc: __FeaturePascal__Service) {}

  @Get()
  async handler(@Query() q: __FeaturePascal__QueryDto): Promise<ApiResponse<{ ok: true } | null>> {
    const started = Date.now();
    try {
      await this.svc.run(q);
      return {
        statusCode: 200,
        errors: [],
        latency: Date.now() - started,
        data: { ok: true },
      };
    } catch (e: any) {
      return {
        statusCode: 500,
        errors: [String(e?.message ?? e)],
        latency: Date.now() - started,
        data: null,
      };
    }
  }
}
```

### `templates/api-feature/feature.service.ts.tpl`

```ts
import { Injectable } from '@nestjs/common';
import { __FeaturePascal__QueryDto } from './dto/__featureKebab__.dto';

@Injectable()
export class __FeaturePascal__Service {
  async run(_q: __FeaturePascal__QueryDto): Promise<void> {
    // TODO: implement
  }
}
```

### `templates/api-feature/dto/feature.dto.ts.tpl`

```ts
import { IsOptional, IsString } from 'class-validator';

export class __FeaturePascal__QueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
```

---

## 3) Generator script

### `scripts/gen-api.ts`

```ts
#!/usr/bin/env ts-node

import fs from 'node:fs';
import path from 'node:path';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function toKebab(s: string) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toPascal(s: string) {
  const clean = s.replace(/[-_]/g, ' ').trim();
  return clean
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
}

function render(tpl: string, vars: Record<string, string>) {
  let out = tpl;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(k, v);
  }
  return out;
}

const rawName = process.argv[2];
if (!rawName) fail('Usage: pnpm gen:api <FeatureName>  (e.g. imdb-search or ImdbSearch)');

const featureKebab = toKebab(rawName);
const featurePascal = toPascal(rawName);

const repoRoot = process.cwd();
const templatesRoot = path.join(repoRoot, 'templates', 'api-feature');
const featureDir = path.join(repoRoot, 'src', featureKebab);

if (fs.existsSync(featureDir)) fail(`Feature already exists: ${featureDir}`);

fs.mkdirSync(path.join(featureDir, 'dto'), { recursive: true });

const vars = {
  '__featureKebab__': featureKebab,
  '__FeaturePascal__': featurePascal,
};

const files: Array<{ src: string; dst: string }> = [
  {
    src: path.join(templatesRoot, 'feature.module.ts.tpl'),
    dst: path.join(featureDir, `${featureKebab}.module.ts`),
  },
  {
    src: path.join(templatesRoot, 'feature.controller.ts.tpl'),
    dst: path.join(featureDir, `${featureKebab}.controller.ts`),
  },
  {
    src: path.join(templatesRoot, 'feature.service.ts.tpl'),
    dst: path.join(featureDir, `${featureKebab}.service.ts`),
  },
  {
    src: path.join(templatesRoot, 'dto', 'feature.dto.ts.tpl'),
    dst: path.join(featureDir, 'dto', `${featureKebab}.dto.ts`),
  },
];

for (const f of files) {
  const tpl = fs.readFileSync(f.src, 'utf8');
  fs.writeFileSync(f.dst, render(tpl, vars), 'utf8');
}

console.log(`Created feature: src/${featureKebab}/`);
console.log(`Next: import ${featurePascal}Module in AppModule.`);
```

---

## 4) Wire it into package scripts

In `package.json`:

```json
{
  "scripts": {
    "gen:api": "ts-node scripts/gen-api.ts"
  }
}
```

If `ts-node` isn’t installed:

```bash
pnpm add -D ts-node typescript
```

---

## 5) How future devs use it

```bash
pnpm gen:api imdb-search
# then add ImdbSearchModule to AppModule imports
```

---

If the current repo is still using “controllers registered in AppModule” instead of modules, keep the generator as-is and just add a “module import step” in the output message (already there). Once the repo migrates fully to feature modules, new APIs become totally mechanical.