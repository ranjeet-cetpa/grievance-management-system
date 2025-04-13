import { log } from 'console';
import { logout } from './features/auth/authSlice';

const DFCCIL_UAT = {
  apiUrl: 'https://uatgrievancesservices.dfccil.com/api',
  orgHierarchy: 'https://uatorganization.dfccil.com/api',
  logoutUrl: 'http://uat.dfccil.com/DfcHome',
  powerOffUrl: 'http://uat.dfccil.com/DfcHome',
};

const PROD_DFCCIL = {
  apiUrl: 'https://grievanceservices.dfccil.com/api',
  orgHierarchy: 'https://orgsvc.dfccil.com/api',
  logoutUrl: 'https://it.dfccil.com/Home/Home',
  powerOffUrl: 'http://uat.dfccil.com/DfcHome',
};

export const environment = import.meta.env.VITE_ENV === 'production' ? PROD_DFCCIL : DFCCIL_UAT;
