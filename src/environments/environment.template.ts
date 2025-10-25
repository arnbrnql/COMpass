/**
 * Environment Configuration Template
 *
 * Copy this file to:
 * - environment.ts (for development)
 * - environment.prod.ts (for production)
 *
 * Then replace the placeholder values with your actual Firebase credentials.
 *
 * IMPORTANT: Never commit the actual environment.ts or environment.prod.ts files!
 * They are already in .gitignore to prevent accidental commits.
 */

import { AppConfig } from '../app/core/config/app-config.interface';

export const environment: AppConfig = {
  production: false, // Set to true for production
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID'
  },
  recaptchaEnterpriseKey: 'YOUR_RECAPTCHA_ENTERPRISE_KEY',
  // Optional repository provider overrides allow tests and local environments to swap
  // implementations without touching the app configuration. For example:
  // repositoryProviderOverrides: {
  //   auth: MockAuthRepository,
  // },
};

