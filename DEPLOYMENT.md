# Production configuration

Do not commit real values. Configure the following settings in the Azure App Service environment:

```text
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__SqlConnection=<Azure SQL connection string>
FrontendUrl=https://<production-frontend-origin>
TokenOptions__Issuer=<production issuer>
TokenOptions__Audience=<production audience>
TokenOptions__AccessTokenExpiration=<positive minutes>
TokenOptions__RefreshTokenExpiration=<positive days>
TokenOptions__SecurityKey=<unique production key of at least 64 UTF-8 bytes>
```

`FrontendUrl` must be one HTTP(S) origin without a path, query string, or fragment. The production JWT key must not reuse the development/default value or a placeholder.

Configure this public, non-secret build-time value in Vercel:

```text
VITE_API_URL=https://<production-backend-host>/api
```

Vite embeds `VITE_*` values in the browser bundle, so they must never contain credentials or secrets.

The liveness endpoint is `GET /health`. OpenAPI and development data seeding remain disabled outside the Development environment. Database migrations are not applied automatically in Production and must be run as a separate, controlled deployment step.
