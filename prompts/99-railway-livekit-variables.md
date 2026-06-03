Add Livekit environment variables to Railway service.
Using [Railway CLI](https://docs.railway.com/cli)
- Railway variable values are in local `.env` file.
	- RAILWAY_TOKEN
	- RAILWAY_TOKEN_NAME
	- RAILWAY_TOKEN_SCOPE
- Livekit variable values are in local `.env` file.
	- LIVEKIT_WEBSOCKET_URL
	- LIVEKIT_URL
	- LIVEKIT_API_KEY
	- LIVEKIT_API_SECRET

The railway cli is installed on local dev machine.
You have permission to use the railway cli.

## 1. Log in and link projects

```
railway login
```

Repository link:

```
railway link
```

If already linked:

```
railway status
```
    

## 2. CLI execution:

```bash
railway variables set \
  LIVEKIT_API_KEY=xxx \
  LIVEKIT_API_SECRET=yyy \
  LIVEKIT_URL=wss://zzz.livekit.cloud \
  --service kia-server
```

## 3. Verify:

```bash
railway variables list --service kia-server
```

Nothing else is required for the `kia-server` side. 