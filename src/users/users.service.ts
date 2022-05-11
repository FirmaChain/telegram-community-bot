import { User } from "src/dtos/user.dto";
import { UserRepository } from "src/repositories/user.repository";

export class UsersService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  private getUsers(chatId: number): User[] {
    return JSON.parse(this.userRepo.get(chatId));
  }

  findUser(chatId: number, id: number): User | undefined {
    let users: User[] = this.getUsers(chatId);
    const findUserIdx: number = this.findUserIdx(chatId, id);

    if (findUserIdx === -1) {
      return undefined;
    } else {
      return users[findUserIdx];
    }
  }

  findUserIdx(chatId: number, id: number): number | undefined {
    let users: User[] = this.getUsers(chatId);
    
    return users.findIndex(elem => elem.id === id);
  }

  popUser(chatId: number, id: number): User | undefined {
    let users: User[] = this.getUsers(chatId);
    const findUserIdx: number = this.findUserIdx(chatId, id);

    if (findUserIdx === -1) {
      return undefined;
    }

    const popUser: User = users.splice(findUserIdx, 1)[0];
    this.userRepo.save(chatId, users);
    return popUser;
  }

  addUser(chatId: number, id: number) {
    let users: User[] = this.getUsers(chatId);
    const findUserIdx: number = this.findUserIdx(chatId, id);
    const date = Math.floor(new Date().getTime() / 1000);

    if (findUserIdx === -1) {
      users.push({
        id: id,
        date: date
      });
    } else {
      users[findUserIdx].date = date;
    }
    
    this.userRepo.save(chatId, users);
  }

  removeUser(chatId: number, id: number) {
    let users: User[] = this.getUsers(chatId);
    const findUserIdx: number = this.findUserIdx(chatId, id);

    if (findUserIdx !== -1) {
      users.splice(findUserIdx, 1);
      this.userRepo.save(chatId, users);
    }
  }
}