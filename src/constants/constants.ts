import { getAlert, getAlertAlreadyUser, getAlertNotJoinUser, getAlertUserCheck, getNotice, getPermission } from "src/components/localeConfig.component";

export function getNoticeDataByLocale(language_code: string, name: string) {
  const locale: string = language_code === 'ko' ? language_code : "en";
  const notice = getNotice(locale);
  const message: string = notice.message.replace('XXX', `${name}`);

  return {
    message: message,
    query: notice.query
  }
}

export function getPermissionDataByLocale(language_code: string, name: string) {
  const locale: string = language_code === 'ko' ? language_code : "en";
  const permission = getPermission(locale);

  return {
    message: `${name}${permission.message}`,
    query: permission.query
  }
}

export function getAlertMessageByLocale(language_code: string): string {
  const locale: string = language_code === 'ko' ? language_code : "en";
  const alert = getAlert(locale);

  return alert.message;
}

export function getNotYoursAlertMessageByLocale(language_code: string): string {
  const locale: string = language_code === 'ko' ? language_code : "en";
  const alert = getAlertUserCheck(locale);

  return alert.message;
}

export function getAlreadyAlertMessageByLocale(language_code: string): string {
  const locale: string = language_code === 'ko' ? language_code : "en";
  const alert = getAlertAlreadyUser(locale);
  
  return alert.message;
}

export function getNotJoinMessageByLocale(language_code: string): string {
  const locale: string = language_code === 'ko' ? language_code : "en";
  const alert = getAlertNotJoinUser(locale);

  return alert.message;
}

export function getNewChatMemberRestrictOption() {
  return {
    can_send_messages: false,
    can_send_media_messages: false,
    can_send_polls: false,
    can_send_other_messages: false,
    can_add_web_page_previews: false,
    can_change_info: false,
    can_invite_users: false,
    can_pin_messages: false
  }
}