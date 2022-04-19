import fs from 'fs';
import { join } from "path";
import { NewChatMemberData } from "src/dtos/newChatMember.dto";

export class NewChatMemberComponent {
  private newChatMemberList: Map<string, Array<NewChatMemberData>>;
  private filePath: string;

  constructor() {
    this.newChatMemberList = new Map<string, Array<NewChatMemberData>>();
    this.filePath = join(__dirname, '../../config/', process.env.NEW_CHAT_MEMBER_FILE_NAME);

    this.existFile();
    
    const fsData = fs.readFileSync(this.filePath, 'utf-8');
    const jsonParseData = JSON.parse(fsData);

    for (let chatId of Object.keys(jsonParseData)) {
      const newMemberInfo = jsonParseData[chatId];
      this.newChatMemberList.set(chatId, newMemberInfo);
    }
  }

  addNewChatMember(chatId: number, userId: number, date: number) {
    const strChatId: string = chatId.toString();
    let hasUser: boolean = false;

    if (!this.newChatMemberList.has(strChatId)) {
      this.newChatMemberList.set(strChatId, JSON.parse("[]"));
    }

    this.newChatMemberList.get(strChatId).forEach(elem => {
      if (elem.userId === userId) {
        elem.date = date;
        hasUser = true;
        return ;
      }
    });
    
    if (hasUser) {
      return ;
    }

    this.newChatMemberList.get(strChatId).push({ userId, date });
    this.saveDataAtJsonFile();
  }

  getUserDate(chatId: number, userId: number): number {
    const strChatId: string = chatId.toString();
    let retDate: number = 0;

    this.newChatMemberList.get(strChatId).forEach(elem => {
      if (elem.userId === userId) {
        retDate = elem.date;
        return ;
      }
    });

    return retDate;
  }

  deleteNewChatMember(chatId: number, userId: number) {
    const strChatId: string = chatId.toString();
    let retIndex: number = -1;

    this.newChatMemberList.get(strChatId).forEach((elem, index) => {
      if (elem.userId === userId) {
        retIndex = index;

        this.newChatMemberList.get(strChatId).splice(index, 1);
        this.saveDataAtJsonFile();
        return ;
      }
    });

    return retIndex;
  }

  hasUser(chatId: number, userId: number): boolean {
    const strChatId: string = chatId.toString();
    let check: boolean = false;

    this.newChatMemberList.get(strChatId).forEach(elem => {
      if (elem.userId === userId) {
        check = true;
        return ;
      }
    });

    return check;
  }

  private existFile() {
    const isExistsFile = fs.existsSync(this.filePath);

    if (!isExistsFile) {
      console.log('[CREATE][NEWCHATMEMBER] not found json file & create json file');

      this.saveDataAtJsonFile();
    }
  }

  private saveDataAtJsonFile() {
    fs.writeFileSync(this.filePath, JSON.stringify(Object.fromEntries(this.newChatMemberList)));
  }
}