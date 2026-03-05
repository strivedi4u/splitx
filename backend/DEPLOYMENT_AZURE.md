# Azure Web App Deployment Instructions

1. Ensure your app listens on the port provided by Azure:
   - Your code already uses `process.env.PORT`, which is correct.

2. Required files:
   - `index.js` (entry point)
   - `web.config` (for IISNode on Windows Azure)
   - `package.json` (with correct scripts and engines)

3. Deployment steps:
   - Push your code to Azure (via GitHub, Azure CLI, or VS Code Azure extension).
   - Azure will run `npm install` and `npm start` by default.

4. Environment variables:
   - Set production secrets (like JWT keys, etc.) in Azure Portal > Configuration > Application settings.

5. Static files:
   - Your static files in `public/` will be served as configured.

6. Logs:
   - Use Azure App Service logs for troubleshooting.

7. Node version:
   - Specified in `package.json` under `engines`.

For more, see: https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs
