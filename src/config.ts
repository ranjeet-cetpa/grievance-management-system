import { log } from 'console';
import { logout } from './features/auth/authSlice';

const DEV_CONFIG = {
  apiUrl: 'https://tms-services.cetpainfotech.com/api',
  orgHierarchy: 'https://uat.dfccilorganization.services.cetpainfotech.com/api',
  loginUrl: 'https://uat.tourservices.cetpainfotech.com/api',
  logoutUrl: 'http://localhost:3001/',
};
const CETPA_UAT = {
  apiUrl: 'https://uat.grivance.services.dfccil.cetpainfotech.com/api',
  orgHierarchy: 'https://uat.dfccilorganization.services.cetpainfotech.com/api',
  loginUrl: 'https://uat.tourservices.cetpainfotech.com/api',
  logoutUrl: 'https://tms.cetpainfotech.com',
};

const DFCCIL_UAT = {
  apiUrl: 'https://uattaskmanageapi.dfccil.com/api',
  orgHierarchy: 'https://uatorganization.dfccil.com/api',
  logoutUrl: 'http://uat.dfccil.com/DfcHome',
};

const PROD_DFCCIL = {
  apiUrl: 'https://vmsapi.dfccil.com/api',
  orgHierarchy: 'https://orgsvc.dfccil.com/api',
  logoutUrl: 'https://it.dfccil.com/Home/Home',
};

export const environment = CETPA_UAT;
