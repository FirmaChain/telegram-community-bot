import { LocaleConfig } from 'src/dtos/localConfig.dto';
import localeConfig from '../../config/locale.config.json';

export function getNotice(locale: string): LocaleConfig {
  return localeConfig[locale].notice;
}

export function getPermission(locale: string): LocaleConfig {
  return localeConfig[locale].permission;
}

export function getAlert(locale: string): LocaleConfig {
  return localeConfig[locale].alert;
}

export function getAlertUserCheck(locale: string): LocaleConfig {
  return localeConfig[locale].alertUserCheck;
}

export function getAlertAlreadyUser(locale: string): LocaleConfig {
  return localeConfig[locale].alertAlready;
}

export function getAlertNotJoinUser(locale: string): LocaleConfig {
  return localeConfig[locale].alertNotJoin;
}