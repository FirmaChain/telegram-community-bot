import fs from 'fs';
import { join } from "path";

export class UserRepository {
  private dirPath: string;

  constructor() {
    this.dirPath = join(__dirname, `../../data/users`);

    this.existDir();
  }

  public get(chatId: number) {
    const filePath = `${this.dirPath}/${chatId}.json`;
    const isExistFile = fs.existsSync(filePath);

    if (!isExistFile) {
      console.log('[CREATE][USER REPO] not found user repo & create user repo');

      this.createFile(filePath, []);
    }

    return fs.readFileSync(filePath, 'utf-8');
  }

  public save(chatId: number, data: any) {
    const filePath = `${this.dirPath}/${chatId}.json`;
    this.createFile(filePath, data);
  }

  private createFile(filePath: string, data: any) {
    fs.writeFileSync(filePath, JSON.stringify(data));
  }

  private existDir() {
    const isExistDir = fs.existsSync(this.dirPath);

    if (!isExistDir) {
      console.log('[CREATE][USER DIR] not found user dir & create user dir');

      this.createDir();
    }
  }

  private createDir() {
    fs.mkdirSync(this.dirPath);
  }
}