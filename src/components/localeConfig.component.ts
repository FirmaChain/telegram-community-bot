import { LocaleConfig } from 'src/dtos/localConfig.dto';
import localeConfig from '../../config/locale.config.json';

export function getNotice(locale: string): LocaleConfig {
  return localeConfig[locale].notice;
}

export function getRestrict(locale: string): LocaleConfig {
  return localeConfig[locale].permission;
}

export function getAlert(type: string, locale: string): LocaleConfig {
  return localeConfig[locale][type];
}