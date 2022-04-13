import { LocaleConfig } from 'src/dtos/localConfig.dto';
import localConfig from '../../config/locale.config.json';

export function getNotice(locale: string): LocaleConfig {
  return localConfig[locale].notice;
}

export function getPermission(locale: string): LocaleConfig {
  return localConfig[locale].permission;
}

export function getAlert(locale: string): LocaleConfig {
  return localConfig[locale].alert;
}

export function getAlertUserCheck(locale: string): LocaleConfig {
  return localConfig[locale].alertUserCheck;
}

export function getAlertAlreadyUser(locale: string): LocaleConfig {
  return localConfig[locale].alertAlready;
}