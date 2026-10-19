import { Environment } from './environment.model';

// Used by `ng serve` and `ng build --configuration development`.
export const environment: Environment = {
  production: false,
  // Local API: `dotnet run --project Umss.BloodOrgansDonationApp.API` (Kestrel listens on 7140).
  apiUrl: 'http://localhost:7140/api',
  // Same Keycloak as the API's appsettings.Development.json, so locally issued tokens are
  // accepted by the local API.
  keycloak: {
    url: 'https://auth-server-b24f.onrender.com',
    realm: 'organ-donation-prod',
    clientId: 'organ-donation-web',
  },
};
