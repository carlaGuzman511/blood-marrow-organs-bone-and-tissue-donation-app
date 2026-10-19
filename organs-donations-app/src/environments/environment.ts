import { Environment } from './environment.model';

// Production (default build, deployed on Vercel). `ng serve` / the development configuration
// replaces this file with environment.development.ts (see fileReplacements in angular.json).
export const environment: Environment = {
  production: true,
  apiUrl: 'https://blood-marrow-organs-bone-and-tissue.onrender.com/api',
  keycloak: {
    url: 'https://auth-server-b24f.onrender.com',
    realm: 'organ-donation-prod',
    clientId: 'organ-donation-web',
  },
};
