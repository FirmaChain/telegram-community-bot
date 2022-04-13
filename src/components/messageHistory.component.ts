import fs from 'fs';
import { join } from 'path';
import { PermissionData } from 'src/dtos/permissionData.dto';

export class MessageHistoryComponent {
  private filePath: string;
  private messages: {
    notice: Array<number>,
    permission: Array<PermissionData>
  };

  constructor() {
    this.filePath = join(__dirname, '../../config/', process.env.NOTICE_FILE_NAME);
    this.messages = {
      notice: new Array<number>(),
      permission: new Array<PermissionData>()
    }

    this.existFile();
    this.messages = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
  }

  getMessageLengthByType(type: string): number {
    return this.messages[type].length;
  }

  addMessageIdWithType(type: string, messageId: any) {
    this.messages[type].push(messageId);
    this.saveDataAtJsonFile();
  }

  getMessageIdListExcludingLastArray(type: string) {
    let retList = [];
    if (this.messages[type].length === 1)
      return retList;
    
    retList = this.messages[type].splice(0, this.messages[type].length - 1);
    this.saveDataAtJsonFile();
    return retList;
  }
  
  getMessageList(type: string): Array<any> {
    return this.messages[type];
  }

  getRemoveTimeOutPermissionMsg(): Array<PermissionData> {
    let retData = [];
    this.messages['permission'].forEach((elem, index) => {
      const nowTime = Math.floor(new Date().getTime() / 1000);
      const timeLimit = (60 * 3) + 10;
      const timeInterval = nowTime - elem.date;

      if (timeInterval > timeLimit) {
        const message: PermissionData[] = this.messages['permission'].splice(index, 1);
        retData.push(message[0]);
      }
    });
    this.saveDataAtJsonFile();
    return retData;
  }

  removePermissionMessage(chatId: number, messageId: number): boolean {
    this.messages['permission'].forEach((elem, index) => {
      if (elem.chatId === chatId && elem.message_id === messageId) {
        this.messages['permission'].splice(index, 1);
        return true;
      }
    });
    return false;
  }

  private saveDataAtJsonFile() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.messages));
  }

  private existFile() {
    const isExistsFile = fs.existsSync(this.filePath);

    if (!isExistsFile) {
      console.log('[CREATE][MESSAGEHISTORY] not found json file & create json file');
      
      this.saveDataAtJsonFile();
    }
  }
}