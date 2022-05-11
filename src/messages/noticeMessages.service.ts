import { Message } from "src/dtos/message.dto";
import { MessageRepository } from "src/repositories/message.repository";

export class NoticeMessageService {
  private messageRepo: MessageRepository;

  constructor() {
    this.messageRepo = new MessageRepository();
  }

  private getMessages(chatId: number): Message[] {
    return JSON.parse(this.messageRepo.getNotice(chatId));
  }

  getCount(chatId: number): number {
    let messages: Message[] = this.getMessages(chatId);
    return messages.length; 
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

  popMessage(chatId: number): Message | undefined {
    let messages: Message[] = this.getMessages(chatId);

    const popMessage: Message = messages.splice(0, 1)[0];
    this.messageRepo.saveNotice(chatId, messages);
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

    this.messageRepo.saveNotice(chatId, messages);
  }
}