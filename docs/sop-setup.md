# NestJS API – End-to-End SOP

Scope:

- Create NestJS server
    
- Implement `/status` and `/about`
    
- Run locally with **pnpm**
    
- Deploy to **Railway via GitHub `main` branch**
    
- Re-implement cleanly from scratch if needed
    

No guesswork. Follow steps in order.

---

# 0. Prerequisites

Install:

- Node.js LTS (≥ 20)
    
- Git
    
- GitHub account
    
- Railway account (GitHub connected)
    

Verify:

```bash
node -v
git --version
```

---

# 1. Enable pnpm (via Corepack)

Node 20 ships with Corepack.

```bash
corepack enable
pnpm -v
```

If that prints a version → ready.

---

# 2. Create NestJS App

```bash
pnpm dlx @nestjs/cli new api
```

Select:

```
pnpm
```

Then:

```bash
cd api
```

---

# 3. Implement Endpoints

## 3.1 Generate controller

```bash
pnpm nest g controller meta
```

---

## 3.2 Replace `src/meta/meta.controller.ts`

```ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class MetaController {

  @Get('status')
  status() {
    return {
      ok: true,
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('about')
  about() {
    return {
      name: 'api',
      description: 'NestJS service deployed on Railway',
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }
}
```

---

## 3.3 Register controller

Edit `src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { MetaController } from './meta/meta.controller';

@Module({
  imports: [],
  controllers: [MetaController],
  providers: [],
})
export class AppModule {}
```

---

# 4. Make Server Railway-Compatible

Railway injects a `PORT`.  
Never hardcode `3000`.

Edit `src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = parseInt(process.env.PORT ?? '3000', 10);

  await app.listen(port);
}
bootstrap();
```

---

# 5. Local Development

## 5.1 Install dependencies

```bash
pnpm install
```

If warning about ignored build scripts appears:

Ignore unless build fails.

---

## 5.2 Development mode

```bash
pnpm run start:dev
```

Visit:

```
http://localhost:3000/status
http://localhost:3000/about
```

Expected JSON responses.

---

## 5.3 Production build test (important before deploy)

```bash
pnpm run build
pnpm run start:prod
```

Test again:

```bash
curl http://localhost:3000/status
```

If production build works locally → deployment will work.

---

# 6. GitHub Setup

From project root:

```bash
git init
git add .
git commit -m "Initial NestJS API with status/about"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

Confirm:

- `main` branch exists
    
- Code visible in GitHub
    

---

# 7. Railway Deployment

## 7.1 Create Project

1. Log into Railway
    
2. New Project
    
3. Deploy from GitHub repo
    
4. Select repo
    
5. Select branch: `main`
    

---

## 7.2 Set Build & Start Commands (IMPORTANT)

Go to Service → Settings → Deploy

Set:

**Build Command**

```
pnpm install && pnpm run build
```

**Start Command**

```
pnpm run start:prod
```

---

## 7.3 Confirm PORT Binding

Railway auto-sets `PORT`.

No need to configure manually.

---

# 8. Deploy Flow

Deployment happens automatically when:

- Push to `main`
    
- Merge PR into `main`
    

To test:

```bash
git commit --allow-empty -m "Trigger deploy"
git push
```

Watch Railway logs.

---

# 9. Verify Production

Railway provides a public domain:

```
https://your-service.up.railway.app
```

Test:

```
/status
/about
```

Must return valid JSON.

---

# 10. Full Re-Implementation Checklist

If starting fresh or onboarding a new dev:

### Clean Rebuild Procedure

1. Install Node LTS
    
2. Enable corepack
    
3. `pnpm dlx @nestjs/cli new api`
    
4. Implement controller
    
5. Modify `main.ts`
    
6. Run `pnpm run build`
    
7. Test endpoints locally
    
8. Push to GitHub `main`
    
9. Connect Railway
    
10. Set build/start commands
    
11. Verify deployment URL
    

If all steps succeed → re-implementation complete.

---

# 11. Common Failures + Fixes

## App not accessible on Railway

Cause:  
Hardcoded port.

Fix:  
Ensure `process.env.PORT` used in `main.ts`.

---

## “No start command found”

Cause:  
Railway not detecting script.

Fix:  
Manually set:

```
pnpm run start:prod
```

---

## Build fails locally

Run:

```bash
pnpm approve-builds
pnpm install
```

Only if necessary.

---

# 12. Minimal Production Hardening (Recommended Next)

After baseline works:

- Enable CORS
    
- Add global validation pipe
    
- Add `/healthz`
    
- Add request logging
    
- Add `.env` support via `@nestjs/config`
    
- Add e2e test hitting `/status`
    

---

# Final Architecture Summary

Structure:

```
src/
  main.ts
  app.module.ts
  meta/
    meta.controller.ts
```

Endpoints:

```
GET /status
GET /about
```

Build:

```
pnpm run build
```

Start:

```
pnpm run start:prod
```

Deploy trigger:

```
Push to main
```

---

## Add Swagger (NestJS)

### 1) Install packages

```bash
pnpm add @nestjs/swagger swagger-ui-express
```

### 2) Update `src/main.ts`

Add Swagger setup before `listen()`:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('NestJS API')
    .setVersion(process.env.npm_package_version ?? '0.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
}
bootstrap();
```

### 3) Add basic Swagger metadata to endpoints (optional but useful)

Edit `src/meta/meta.controller.ts`:

```ts
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('meta')
@Controller()
export class MetaController {
  @Get('status')
  @ApiOkResponse({
    schema: {
      example: { ok: true, service: 'api', timestamp: '2026-02-15T00:00:00.000Z' },
    },
  })
  status() {
    return { ok: true, service: 'api', timestamp: new Date().toISOString() };
  }

  @Get('about')
  @ApiOkResponse({
    schema: {
      example: { name: 'api', description: 'NestJS service deployed on Railway', version: '0.0.0' },
    },
  })
  about() {
    return {
      name: 'api',
      description: 'NestJS service deployed on Railway',
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }
}
```

### 4) Run + verify

```bash
pnpm run start:dev
```

Open:

- `http://localhost:3000/docs` (Swagger UI)
    
- `http://localhost:3000/docs-json` (OpenAPI JSON)
    

### 5) Deploy

Commit + push to `main`. Railway redeploys. Swagger will be at:

- `https://<railway-domain>/docs`
    

If Swagger UI is publicly exposed and that’s not desired, say so—can lock it down by environment or basic auth.