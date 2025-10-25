import { RepositoryProviderOverrides } from '../../domain/repositories/repository.tokens';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

export interface AppConfig {
  production: boolean;
  firebase: FirebaseConfig;
  recaptchaEnterpriseKey: string;
  repositoryProviderOverrides?: RepositoryProviderOverrides;
}

