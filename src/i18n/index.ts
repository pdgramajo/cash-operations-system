import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonES from './locales/es/common.json';
import navigationES from './locales/es/navigation.json';
import branchES from './locales/es/branch.json';
import sessionES from './locales/es/session.json';
import transactionES from './locales/es/transaction.json';
import movementES from './locales/es/movement.json';
import reportES from './locales/es/report.json';
import validationES from './locales/es/validation.json';

const resources = {
  es: {
    common: commonES,
    navigation: navigationES,
    branch: branchES,
    session: sessionES,
    transaction: transactionES,
    movement: movementES,
    report: reportES,
    validation: validationES,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  ns: ['common', 'navigation', 'branch', 'session', 'transaction', 'movement', 'report', 'validation'],
  defaultNS: 'common',
});

export default i18n;