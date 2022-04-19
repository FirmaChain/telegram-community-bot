import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { join } from 'path';
import { MessageHistoryComponent } from 'src/components/messageHistory.component';
import { NewChatMemberComponent } from 'src/components/newChatMember.component';
import { getNoticeDataByLocale, getPermissionDataByLocale, getAlertMessageByLocale, getNewChatMemberRestrictOption, getNotYoursAlertMessageByLocale, getAlreadyAlertMessageByLocale, getNotJoinMessageByLocale } from 'src/constants/constants';
import { TYPE } from 'src/defines/define';
import { MessageInfo } from 'src/dtos/chatMessage.dto';

@Injectable()
export class TelebotService implements OnModuleInit {
  token: string;
  telegramBot: TelegramBot;
  messageHistoryComponent: MessageHistoryComponent;
  newChatMemberComponent: NewChatMemberComponent;
  
  onModuleInit() {
    this.init();
    this.onTelegramMessage();
    this.initScheduleForDeletePermissionMsg();
  }

  private async init() {
    this.token = process.env.TOKEN;
    this.telegramBot = new TelegramBot(this.token, { polling: true });
    this.messageHistoryComponent = new MessageHistoryComponent();
    this.newChatMemberComponent = new NewChatMemberComponent();
  }

  private onTelegramMessage() {
    this.telegramBot.on('message', async (msg: TelegramBot.Message) => {
      if (msg.chat.type !== 'supergroup' || (msg.text !== undefined && msg.text !== null)) {
        return;
      }

      const newChatMember: TelegramBot.User = msg['new_chat_member'];

      if (newChatMember !== undefined && newChatMember !== null) {
        const chatId: number = msg.chat.id;
        const deleteMessage: boolean = await this.telegramBot.deleteMessage(chatId, msg.message_id.toString());

        if (deleteMessage) {
          const restrictChatMember: boolean = await this.telegramBot.restrictChatMember(chatId, newChatMember.id.toString(), getNewChatMemberRestrictOption());

          if (restrictChatMember) {
            const newChatMemberSendMsgOption = getPermissionDataByLocale(newChatMember.language_code, newChatMember.first_name);
            let permissionQuery = JSON.stringify(newChatMemberSendMsgOption.query);
            let replacePermissionQuery = JSON.parse(permissionQuery.replace("\\\\", ""));
            replacePermissionQuery.reply_markup.inline_keyboard[0][0].callback_data = `change_permission_${newChatMember.id}`;

            const message = await this.telegramBot.sendMessage(chatId, newChatMemberSendMsgOption.message, replacePermissionQuery);
            const nowTime = Math.floor(new Date().getTime() / 1000);

            this.messageHistoryComponent.addMessage(chatId, 'permission', message.message_id, message.date);
            this.newChatMemberComponent.addNewChatMember(chatId, newChatMember.id, nowTime);
          }
        }
      }

      const leftChatMember: TelegramBot.User = msg.left_chat_member;

      if (leftChatMember !== undefined && newChatMember !== null) {
        const chatId: number = msg.chat.id;
        const deleteMessage: boolean = await this.telegramBot.deleteMessage(chatId, msg.message_id.toString());

        if (deleteMessage) {
          this.newChatMemberComponent.deleteNewChatMember(chatId, leftChatMember.id);
        }
      }
    });

    this.telegramBot.on('callback_query', async (query: TelegramBot.CallbackQuery) => {
      const isChangePermission = query.data.includes('change_permission');
      
      if (isChangePermission) {
        const messageUserId = query.data.includes(query.from.id.toString());
        
        if (!messageUserId) {
          this.telegramBot.answerCallbackQuery(query.id, {
            text: getNotYoursAlertMessageByLocale(query.from.language_code),
            show_alert: true
          });
        } else {
          const chatId: number = query.message.chat.id;
          const chatInfo: TelegramBot.Chat = await this.telegramBot.getChat(query.from.id);
          const targetUser: TelegramBot.ChatMember = await this.telegramBot.getChatMember(chatId, chatInfo.id.toString());
          const canSendMessage: boolean = targetUser.can_send_messages;
    
          const newMemberEnterTime: number = this.newChatMemberComponent.getUserDate(chatId, query.from.id);
          const nowTime = Math.floor(new Date().getTime() / 1000);
          const timeLimit: number = (60 * 3);
          const canEnterGroup = (nowTime - newMemberEnterTime) < timeLimit ? true : false;
    
          if (!this.newChatMemberComponent.hasUser(chatId, query.from.id)) {
            // Not join user
            this.telegramBot.answerCallbackQuery(query.id, {
              text: getNotJoinMessageByLocale(query.from.language_code),
              show_alert: true
            });
          } else if (canSendMessage === undefined || canSendMessage === null || canEnterGroup === false) {
            // permission lock user
            this.telegramBot.answerCallbackQuery(query.id, {
              text: getAlertMessageByLocale(query.from.language_code),
              show_alert: true
            });
          } else if (canSendMessage) {
            // permission unclock user
            this.telegramBot.answerCallbackQuery(query.id, {
              text: getAlreadyAlertMessageByLocale(query.from.language_code),
              show_alert: true
            });
          } else if (!canSendMessage) {
            const isChangePermission = await this.telegramBot.restrictChatMember(chatId, query.from.id.toString(), {
              can_send_messages: true
            });
    
            if (isChangePermission) {
              const messageId: number = query.message.message_id;
              
              if (!this.messageHistoryComponent.removePermissionMessage(chatId, messageId)) {
                console.log('[WARN] Message is not found');
              }
    
              this.newChatMemberComponent.deleteNewChatMember(chatId, query.from.id);
              await this.telegramBot.deleteMessage(chatId, messageId.toString());
              
              const welcomeInfo = getNoticeDataByLocale(query.from.language_code, query.from.first_name);
              const firmachainImgPath: string = join(__dirname, '../..', '/public/firmachain.png');
              const noticeMsg = await this.telegramBot.sendPhoto(chatId, firmachainImgPath, {
                caption: welcomeInfo.message,
                reply_markup: welcomeInfo.query.reply_markup,
                parse_mode: 'Markdown'
              });

              this.messageHistoryComponent.addMessage(chatId, TYPE.NOTICE, noticeMsg.message_id, noticeMsg.date);
              
              if (this.messageHistoryComponent.getMessageLength(chatId.toString(), TYPE.NOTICE) >= 2) {
                const messageList: Array<MessageInfo> = this.messageHistoryComponent.popMessagesExcludeLastIndex(chatId, TYPE.NOTICE);
                messageList.forEach(async elem => {
                  await this.telegramBot.deleteMessage(chatId, elem.messageId.toString());
                });
              }
            }
          }
        }
      }
    });
    this.telegramBot.on('polling_error', console.log);
  }

  private initScheduleForDeletePermissionMsg() {
    setInterval(() => {
      const messages = this.messageHistoryComponent.getRemoveTimeOutPermissionMsg();

      messages.forEach((value, key) => {
        value.forEach(async elem => {
          await this.telegramBot.deleteMessage(parseInt(key), elem.messageId.toString());
        });
      });
    }, 10000);
  }
}
