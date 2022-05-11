import { getNotice, getRestrict, getAlert } from "src/components/localeConfig.component";

export function getNoticeData(language_code: string, name: string) {
  const locale: string = language_code === 'ko' ? language_code : "en";
  const notice = getNotice(locale);
  const message: string = notice.message.replace('XXX', `${name}`);

  return {
    message: message,
    query: notice.query
  }
}

export function getRestrictData(language_code: string, name: string) {
  const locale: string = language_code === 'ko' ? language_code : "en";
  const permission = getRestrict(locale);

  return {
    message: `${name}${permission.message}`,
    query: permission.query
  }
}

export function getAlertMessage(type: string, language_code: string): string {
  const locale: string = language_code === 'ko' ? language_code : "en";
  const alert = getAlert(type, locale);

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