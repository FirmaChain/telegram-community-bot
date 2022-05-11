import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

import { join } from 'path';
import { getAlertMessage, getNewChatMemberRestrictOption, getNoticeData, getRestrictData } from 'src/constants/constants';
import { ALERT_ALREADY, ALERT_NOT_JOIN, ALERT_USER_CHECK } from 'src/defines/define';
import { Message } from 'src/dtos/message.dto';
import { NoticeMessageService } from 'src/messages/noticeMessages.service';
import { RestrictMessageService } from 'src/messages/restrictMessages.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TelebotService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly restrictMessagesService: RestrictMessageService,
    private readonly noticeMessagesService: NoticeMessageService
  ) {}

  token: string;
  startDate: number;
  telegramBot: TelegramBot;
  scheduling: NodeJS.Timer;

  onModuleInit() {
    this.init();
    this.onTelegramMessage();
    this.initScheduleForDeletePermissionMsg();
  }

  private async init() {
    this.token = process.env.TOKEN;
    this.startDate = Math.floor(new Date().getTime() / 1000);
    this.telegramBot = new TelegramBot(this.token, { polling: true });
  }

  private onTelegramMessage() {
    /* New Chat Member Listener */
    this.telegramBot.addListener('new_chat_members', async (msg: TelegramBot.Message) => {
      // Declare old message
      if (this.startDate >= msg.date) {
        console.log(`[NEWCHAT][BEFORE USER] Before message : ${msg.chat}`);
        return ;
      }

      const newChatMember: TelegramBot.User = msg['new_chat_member'];
      
      // Join the new chat member in group
      if (newChatMember !== undefined && newChatMember !== null) {
        const chatId: number = msg.chat.id;
        const messageId: number = msg.message_id;
        const userId: number = newChatMember.id;
        const lagnuageCode: string = newChatMember.language_code;
        const userName: string = newChatMember.first_name;

        // Delete join the group alert
        await this.telegramBot.deleteMessage(chatId, messageId.toString());
        
        // Set restrict member
        await this.telegramBot.restrictChatMember(chatId, userId.toString(), getNewChatMemberRestrictOption());

        // Make restrict message options
        const restrictMsgOption = getRestrictData(lagnuageCode, userName);
        const originRestrictQuery = JSON.stringify(restrictMsgOption.query);
        const restrictQuery = JSON.parse(originRestrictQuery.replace("\\\\", ""));
        restrictQuery.reply_markup.inline_keyboard[0][0].callback_data = `change_permission_${userId.toString()}`;

        // Send restrict message
        const message = await this.telegramBot.sendMessage(chatId, restrictMsgOption.message, restrictQuery);

        // Save data
        this.usersService.addUser(chatId, userId);
        this.restrictMessagesService.addMessage(chatId, message.message_id);
      };
    });
    
    /* Left Chat Member Listener */
    this.telegramBot.addListener('left_chat_member', async (msg: TelegramBot.Message) => {
      // Declare old message
      if (this.startDate >= msg.date) {
        console.log(`[LEFTCHAT][BEFORE USER] Before message : ${msg.chat}`);
        return ;
      }
      
      const leftChatMember: TelegramBot.User = msg['left_chat_member'];
      
      if (leftChatMember !== undefined && leftChatMember !== null) {
        const chatId: number = msg.chat.id;
        const messageId: number = msg.message_id;
        const userId: number = leftChatMember.id;

        // Delete left the group alert
        await this.telegramBot.deleteMessage(chatId, messageId.toString());
        this.usersService.removeUser(chatId, userId);
      }
    });

    /* Callback Query Listener */
    this.telegramBot.addListener('callback_query', async (query: TelegramBot.CallbackQuery) => {
      const isChangeRestrict = query.data.includes('change_permission');
      
      // Click restric message
      if (isChangeRestrict) {
        const userId: number = query.from.id;
        const chatId: number = query.message.chat.id;
        const queryId: string = query.id;
        const queryData: string = query.data;
        const language_code: string = query.from.language_code;
        const userName: string = query.from.first_name;
        const userChatInfo: TelegramBot.ChatMember = await this.telegramBot.getChatMember(chatId, userId.toString());
        const canSendMessage: boolean = userChatInfo.can_send_messages;
        const messageId: number = query.message.message_id;

        if (!queryData.includes(userId.toString())) {
          // Other user
          await this.telegramBot.answerCallbackQuery(queryId, {
            text: getAlertMessage(ALERT_USER_CHECK, language_code),
            show_alert: true
          });

          return ;
        }

        const userJoinDate: number = this.usersService.findUser(chatId, userId).date;
        const nowTime = Math.floor(new Date().getTime() / 1000);
        const timeLimit: number = (60 * 3);
        const canEnterGroup = (nowTime - userJoinDate) < timeLimit ? true : false;

        if (this.usersService.findUser(chatId, userId) === undefined) {
          // Not join user
          this.telegramBot.answerCallbackQuery(queryId, {
            text: getAlertMessage(ALERT_NOT_JOIN, language_code),
            show_alert: true
          });
        } else if (canSendMessage === undefined || canSendMessage === null || canEnterGroup === false) {
          // Restrict user
          this.telegramBot.answerCallbackQuery(queryId, {
            text: getAlertMessage(ALERT_USER_CHECK, language_code),
            show_alert: true
          });
        } else if (canSendMessage) {
          // Restrict
          this.telegramBot.answerCallbackQuery(queryId, {
            text: getAlertMessage(ALERT_ALREADY, language_code),
            show_alert: true
          });
        } else if (!canSendMessage) {
          await this.telegramBot.restrictChatMember(chatId, userId.toString(), {
            can_send_messages: true
          });

          if (this.restrictMessagesService.findMessage(chatId, messageId) === undefined) {
            console.log('[RESTRICT] Message not found');
            return ;
          }
          // Remove user
          this.usersService.removeUser(chatId, userId);

          const noticeInfo = getNoticeData(language_code, userName);
          const ciPath: string = join(__dirname, '../../..', '/public/firmachain.png');
          const noticeMessage = await this.telegramBot.sendPhoto(chatId, ciPath, {
            caption: noticeInfo.message,
            reply_markup: noticeInfo.query.reply_markup,
            parse_mode: 'Markdown'
          });

          // Remove notice message
          if (this.noticeMessagesService.getCount(chatId) >= 1) {
            const noticePopMessage: Message = this.noticeMessagesService.popMessage(chatId);
            this.telegramBot.deleteMessage(chatId, noticePopMessage.id.toString());
          }

          // Add notice message
          this.noticeMessagesService.addMessage(chatId, noticeMessage.message_id);

          // Remove restrict message
          try {
            this.restrictMessagesService.popMessage(chatId, messageId);
            this.telegramBot.deleteMessage(chatId, messageId.toString());
          } catch (e) {
            console.log(`[CALLBACK] Not delete message for restrict`);
            throw e;
          }
        }
      }
    });
    this.telegramBot.on('polling_error', console.log);
  }

  private initScheduleForDeletePermissionMsg() {
    this.scheduling = setInterval(() => {
      const chatList = this.restrictMessagesService.getChatList();
      
      chatList.forEach(elem => {
        const chatId: number = parseInt(elem.split('.')[0]);
        const messages: Message[] = this.restrictMessagesService.getMessages(chatId);
        
        messages.forEach(async elem_message => {
          const nowTime = Math.floor(new Date().getTime() / 1000);
          const timeLimit = (60 * 3);
          
          if ((nowTime - elem_message.date) > timeLimit) {
            this.restrictMessagesService.popMessage(chatId, elem_message.id);

            try {
              await this.telegramBot.deleteMessage(elem, elem_message.id.toString());
            } catch (e) {
              console.log(`[SCHEDULING] Not delete message for restrict`);
              throw e;
            }
          }
        });
      });
    }, 5000);
  }

  private updateTelegramBot() {
    this.telegramBot.getUpdates()
  }
}
