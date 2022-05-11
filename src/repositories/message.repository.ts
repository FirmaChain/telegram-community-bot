import fs from 'fs';
import { join } from "path";

export class MessageRepository {
  private noticeDirPath: string;
  private restrictDirPath: string;

  constructor() {
    this.noticeDirPath = join(__dirname, `../../data/notices`);
    this.restrictDirPath = join(__dirname, `../../data/restricts`);

    this.existDir();
  }

  public getRestrictChatList() {
    return fs.readdirSync(this.restrictDirPath);
  }

  public getNotice(chatId: number) {
    const filePath = `${this.noticeDirPath}/${chatId}.json`;
    const isExistFile = fs.existsSync(filePath);

    if (!isExistFile) {
      console.log('[CREATE][NOTICE REPO] not found notice repo & create notice repo');

      this.createFile(filePath, []);
    }

    return fs.readFileSync(filePath, 'utf-8');
  }

  public getRestrict(chatId: number) {
    const filePath = `${this.restrictDirPath}/${chatId}.json`;
    const isExistFile = fs.existsSync(filePath);

    if (!isExistFile) {
      console.log('[CREATE][RESTRICT REPO] not found restrict repo & create restrict repo');

      this.createFile(filePath, []);
    }
    
    return fs.readFileSync(filePath, 'utf-8');
  }

  public saveNotice(chatId: number, data: any) {
    const filePath = `${this.noticeDirPath}/${chatId}.json`;
    this.createFile(filePath, data);
  }

  public saveRestrict(chatId: number, data: any) {
    const filePath = `${this.restrictDirPath}/${chatId}.json`;
    this.createFile(filePath, data);
  }

  private createFile(filePath: string, data: any) {
    fs.writeFileSync(filePath, JSON.stringify(data));
  }

  private existDir() {
    if (!fs.existsSync(this.noticeDirPath)) {
      console.log('[CREATE][NOTICE DIR] not found notice dir & create notice dir');
      this.createNoticeDir();
    }

    if (!fs.existsSync(this.restrictDirPath)) {
      console.log('[CREATE][RESTRICT DIR] not found restrict dir & create restrict dir');
      this.createRestrictDir();
    }
  }

  private createNoticeDir() {
    fs.mkdirSync(this.noticeDirPath);
  }

  private createRestrictDir() {
    fs.mkdirSync(this.restrictDirPath);
  }
}