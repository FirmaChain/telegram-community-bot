import fs from 'fs';
import { join } from "path";
import { NewChatMemberData } from "src/dtos/newChatMember.dto";

export class NewChatMemberComponent {
  private filePath: string;
  private newChatMemberList: Array<NewChatMemberData>;

  constructor() {
    this.filePath = join(__dirname, '../../config/', process.env.NEW_CHAT_MEMBER_FILE_NAME);
    this.newChatMemberList = new Array<NewChatMemberData>();

    this.existFile();
    this.newChatMemberList = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
  }

  addNewChatMember(userId: number, date: number) {
    let hasUser: boolean = false;

    this.newChatMemberList.forEach(elem => {
      if (elem.userId === userId) {
        elem.date = date;
        hasUser = true;
      }
    });

    if (hasUser) {
      return ;
    }

    const newChatMember: NewChatMemberData = {
      userId: userId,
      date: date
    };

    this.newChatMemberList.push(newChatMember);
    this.saveDataAtJsonFile();
  }

  getUserDate(userId: number): number {
    let retDate: number = 0;
    this.newChatMemberList.forEach(elem => {
      if (elem.userId === userId)
        retDate = elem.date;
    });
    return retDate;
  }

  deleteNewChatMember(userId: number) {
    let retIndex: number = -1;
    this.newChatMemberList.forEach((elem, index) => {
      if (elem.userId === userId) {
        retIndex = index;

        this.newChatMemberList.splice(index, 1);
        this.saveDataAtJsonFile();
        return;
      }
    });
    return retIndex;
  }

  hasUser(userId: number) {
    let check: boolean = false;

    this.newChatMemberList.forEach(elem => {
      if (elem.userId === userId) {
        check = true;
        return ;
      }
    });

    return check;
  }

  private saveDataAtJsonFile() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.newChatMemberList));
  }

  private existFile() {
    const isExistsFile = fs.existsSync(this.filePath);

    if (!isExistsFile) {
      console.log('[CREATE][NEWCHATMEMBER] not found json file & create json file');
      
      this.saveDataAtJsonFile();
    }
  }
}