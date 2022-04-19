export interface ChatMessage {
  notice: Array<MessageInfo>,
  permission: Array<MessageInfo>
}

export interface MessageInfo {
  messageId: number,
  date: number
}