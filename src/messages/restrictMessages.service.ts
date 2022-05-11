import { Message } from "src/dtos/message.dto";
import { MessageRepository } from "src/repositories/message.repository";

export class RestrictMessageService {
  private messageRepo: MessageRepository;

  constructor() {
    this.messageRepo = new MessageRepository();
  }

  getCount(chatId: number): number {
    let messages: Message[] = this.getMessages(chatId);
    return messages.length; 
  }
  
  getChatList(): string[] {
    return this.messageRepo.getRestrictChatList();
  }

  getMessages(chatId: number): Message[] {
    return JSON.parse(this.messageRepo.getRestrict(chatId));
  }

  findMessage(chatId: number, id: number): Message | undefined {
    let messages: Message[] = this.getMessages(chatId);
    const findMessageIdx: number = messages.findIndex(elem => elem.id === id);

    if (findMessageIdx === -1) {
      return undefined;
    } else {
      return messages[findMessageIdx];
    }
  }

  findMessageIdx(chatId: number, id: number): number {
    let messages: Message[] = this.getMessages(chatId);

    return messages.findIndex(elem => elem.id === id);
  }

  popMessage(chatId: number, id: number): Message | undefined {
    let messages: Message[] = this.getMessages(chatId);
    const findMessageIdx: number = this.findMessageIdx(chatId, id);

    if (findMessageIdx === -1) {
      return undefined;
    }

    const popMessage: Message = messages.splice(findMessageIdx, 1)[0];
    this.messageRepo.saveRestrict(chatId, messages);
    return popMessage;
  }

  addMessage(chatId: number, id: number) {
    let messages = this.getMessages(chatId);
    const findMessageIdx: number = this.findMessageIdx(chatId, id);
    const date = Math.floor(new Date().getTime() / 1000);

    if (findMessageIdx === -1) {
      messages.push({
        id: id,
        date: date
      });
    } else {
      messages[findMessageIdx].date = date;
    }

    this.messageRepo.saveRestrict(chatId, messages);
  }
}