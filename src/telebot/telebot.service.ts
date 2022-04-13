import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { join } from 'path';
import { MessageHistoryComponent } from 'src/components/messageHistory.component';
import { NewChatMemberComponent } from 'src/components/newChatMember.component';
import { getNoticeDataByLocale, getPermissionDataByLocale, getAlertMessageByLocale, getNewChatMemberRestrictOption, getNotYoursAlertMessageByLocale, getAlreadyAlertMessageByLocale } from 'src/constants/constants';
import { PermissionData } from 'src/dtos/permissionData.dto';

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

  private init() {
    this.token = process.env.TOKEN;
    this.telegramBot = new TelegramBot(this.token, { polling: true });
    this.messageHistoryComponent = new MessageHistoryComponent();
    this.newChatMemberComponent = new NewChatMemberComponent();
    console.log(this.telegramBot.isPolling());
  }

  private onTelegramMessage() {
    this.telegramBot.addListener('new_chat_members', (msg: TelegramBot.Message) => {
      console.log(msg);
    })
    
    this.telegramBot.on('message', async (msg: TelegramBot.Message) => {
      console.log(msg);
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

            const sendMsgResult = await this.telegramBot.sendMessage(chatId, newChatMemberSendMsgOption.message, replacePermissionQuery);
            const nowTime = Math.floor(new Date().getTime() / 1000);

            const permissionData: PermissionData = {
              chatId: sendMsgResult.chat.id,
              message_id: sendMsgResult.message_id,
              date: sendMsgResult.date
            };

            this.messageHistoryComponent.addMessageIdWithType('permission', permissionData);
            this.newChatMemberComponent.addNewChatMember(newChatMember.id, nowTime);
          }
        }
      }

      const leftChatMember: TelegramBot.User = msg.left_chat_member;

      if (leftChatMember !== undefined && newChatMember !== null) {
        const chatId: number = msg.chat.id;
        const deleteMessage: boolean = await this.telegramBot.deleteMessage(chatId, msg.message_id.toString());

        if (deleteMessage) {
          this.newChatMemberComponent.deleteNewChatMember(leftChatMember.id);
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
    
          const newMemberEnterTime: number = this.newChatMemberComponent.getUserDate(query.from.id);
          const nowTime = Math.floor(new Date().getTime() / 1000);
          const timeLimit: number = (60 * 3);
          const canEnterGroup = (nowTime - newMemberEnterTime) < timeLimit ? true : false;
    
          if (canSendMessage === undefined || canSendMessage === null || canEnterGroup === false) {
            this.telegramBot.answerCallbackQuery(query.id, {
              text: getAlertMessageByLocale(query.from.language_code),
              show_alert: true
            });
          } else if (canSendMessage) {
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
    
              this.newChatMemberComponent.deleteNewChatMember(query.from.id);
              await this.telegramBot.deleteMessage(chatId, messageId.toString());
              
              const welcomeInfo = getNoticeDataByLocale(query.from.language_code, query.from.first_name);
              const firmachainImgPath: string = join(__dirname, '../..', '/public/firmachain.png');
              const noticeMsg = await this.telegramBot.sendPhoto(chatId, firmachainImgPath, {
                caption: welcomeInfo.message,
                reply_markup: welcomeInfo.query.reply_markup,
                parse_mode: 'Markdown'
              });
    
              this.messageHistoryComponent.addMessageIdWithType('notice', noticeMsg.message_id);
    
              if (this.messageHistoryComponent.getMessageLengthByType('notice') >= 2) {
                const messageList: Array<number> = this.messageHistoryComponent.getMessageIdListExcludingLastArray('notice');
                
                messageList.forEach(async elem => {
                  await this.telegramBot.deleteMessage(chatId, elem.toString());
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
      if (this.messageHistoryComponent.getMessageLengthByType('permission') === 0) {
        console.log("[PERMISSION SCHEDULE] Have not change permission message");
        return;
      }

      try {
        const permissionMsgList = this.messageHistoryComponent.getRemoveTimeOutPermissionMsg();

        permissionMsgList.forEach(async elem => {
          await this.telegramBot.deleteMessage(elem.chatId, elem.message_id.toString());
        });
      } catch (e) {
        console.log('catch : ', e);
        throw e;
      }
    }, 10000);
  }
}
