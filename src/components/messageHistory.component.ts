import fs from 'fs';
import { join } from 'path';
import { TYPE } from 'src/defines/define';
import { ChatMessage, MessageInfo } from 'src/dtos/chatMessage.dto';

export class MessageHistoryComponent {
  private filePath: string;
  private messages: Map<string, ChatMessage>; // ChatId, ChatMessage

  constructor() {
    this.messages = new Map<string, ChatMessage>();
    this.filePath = join(__dirname, '../../config/', process.env.NOTICE_FILE_NAME);

    this.existFile();

    const fsData = fs.readFileSync(this.filePath, 'utf-8');
    const jsonParseData = JSON.parse(fsData);

    for (let chatId of Object.keys(jsonParseData)) {
      const messageInfo = jsonParseData[chatId];
      this.messages.set(chatId, messageInfo);
    }

    this.popMessagesExcludeLastIndex(-1001554033834, 'notice');
  }
  
  addMessage(chatId: number, type: string, messageId: number, date: number) {
    const strChatId: string = chatId.toString();

    if (!this.messages.has(strChatId)) {
      this.messages.set(strChatId, {
        notice: new Array<MessageInfo>(),
        permission: new Array<MessageInfo>()
      });
    }

    const messageInfo: MessageInfo = {
      messageId,
      date
    };

    if (type === TYPE.PERMISSION) {
      this.messages.get(strChatId).permission.push(messageInfo);
    } else if (type === TYPE.NOTICE) {
      this.messages.get(strChatId).notice.push(messageInfo);
    }

    this.saveDataAtJsonFile();
  }

  popMessagesExcludeLastIndex(chatId: number, type: string): Array<MessageInfo> {
    let retList = [];
    const strChatId: string = chatId.toString();

    if (!this.messages.has(strChatId)) {
      console.log(`[WARN][POP] Don't have ChatID (${chatId})`);
      return ;
    }

    const messageLength: number = this.messages.get(strChatId)[type].length;
    if (messageLength <= 1) {
      return retList;
    }

    retList = this.messages.get(strChatId)[type].splice(0, messageLength - 1);
    this.saveDataAtJsonFile();
    return retList;
  }

  getRemoveTimeOutPermissionMsg() {
    let retList = new Map<string, Array<MessageInfo>>();

    const nowTime = Math.floor(new Date().getTime() / 1000);
    const timeLimit = (60 * 3) + 10;

    this.messages.forEach((value, key) => {
      let tempPermission: Array<MessageInfo> = new Array<MessageInfo>();
      
      for (let i = value.permission.length - 1; i >= 0; i--) {
        if ((nowTime - value.permission[i].date) > timeLimit) {
          tempPermission.push(value.permission.splice(i, 1)[0]);
        }
      }

      if (tempPermission.length >= 1)
        retList.set(key, tempPermission);
    });
    this.saveDataAtJsonFile();
    return retList;
  }

  removePermissionMessage(chatId: number, messageId: number): boolean {
    const strChatId: string = chatId.toString();
    let isRemoved: boolean = false;

    if (!this.messages.has(strChatId)) {
      console.log(`[WARN][removePermission] Don't have ChatID (${chatId})`);
      return ;
    }

    this.messages.get(strChatId).permission.forEach((elem, index) => {
      if (elem.messageId === messageId) {
        this.messages.get(strChatId).permission.splice(index, 1);
        isRemoved = true;
        return ;
      }
    });

    this.saveDataAtJsonFile();
    return isRemoved;
  }

  getMessageLength(chatId: string, type: string): number {
    if (!this.messages.has(chatId)) {
      console.log(`[WARN][getMessageLength] Don't have ChatID (${chatId})`);
      return ;
    }

    return this.messages.get(chatId)[type].length;
  }
  
  private existFile() {
    const isExistsFile = fs.existsSync(this.filePath);

    if (!isExistsFile) {
      console.log('[CREATE][MESSAGEHISTORY] not found json file & create json file');
      
      this.saveDataAtJsonFile();
    }
  }

  private saveDataAtJsonFile() {
    fs.writeFileSync(this.filePath, JSON.stringify(Object.fromEntries(this.messages)));
  }
}