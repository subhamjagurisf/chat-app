import { Component, OnInit } from '@angular/core';
import { NgxNotificationService } from 'ngx-notification';
import { PubNubAngular } from 'pubnub-angular2';
import { environment } from '../../environments/environment';
import { Chat, ChatMessage } from '../chat.model';
import { UserService } from '../chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  // styleUrls: ['./chat.component.css']
  styles: [
    `
      ::ng-deep nb-layout-column {
        display: flex;
        justify-content: center;
      }
      :host {
        display: flex;
      }
      nb-chat {
        width: 300px;
        margin: 1rem;
      }
    `,
  ],
})
export class ChatComponent implements OnInit {
  constructor(
    private readonly userHttpService: UserService,
    private readonly pubnub: PubNubAngular,
    private readonly ngxNotificationService: NgxNotificationService
  ) {}

  ngOnInit(): void {
    this.channelUUID = environment.CHAT_ROOM;
    const accessToken = localStorage.getItem('@chat-app-accessToken');
    if (accessToken) {
      this.token = accessToken;
      this.enterToken(accessToken);
      this.isBooted = true;
    } else {
      location.href = '/login';
    }
  }
  public messages: ChatMessage[] = [];
  public senderUUID = '';
  public channelUUID = environment.CHAT_ROOM;
  public token = '';
  public isBooted = false;
  public inRoom = true;

  enterToken(token: string) {
    this.userHttpService.getUserTenantId(token).subscribe((data) => {
      console.log('data from userHttpService of user', data);
      this.senderUUID = data;
    });
  }

  /**
   * Function to leave the chat room
   * - it sets messages to []
   * - unsubscribe from pubnub message
   */
  leaveRoom() {
    this.messages = [];
    this.pubnub.unsubscribe(this.channelUUID);
    this.inRoom = false;
  }

  /**
   * Function to get messages and subscribe to notifications
   */
  getMessages() {
    this.inRoom = true;
    this.userHttpService.get(this.token, this.channelUUID).subscribe((data) => {
      this.messages = [];
      for (const d of data) {
        const temp: ChatMessage = {
          body: d.body,
          subject: d.subject,
          channelType: '0',
          reply: false,
          sender: 'sender',
        };
        if (d.createdBy === this.senderUUID) {
          temp.sender = 'User';
          temp.reply = true;
        }
        this.messages.push(temp);
      }
    });

    this.subcribeToNotifications();
  }

  /**
   * Function to subscribe for notifications in a channel
   */
  subcribeToNotifications() {
    this.pubnub.subscribe({
      channels: [this.channelUUID],
      triggerEvents: ['message'],
    });

    this.pubnub.getMessage(this.channelUUID, (msg) => {
      console.log('Pubnub Subscriptions', msg);
      const receivedMessage: ChatMessage = {
        body: msg.message.description,
        subject: msg.message.title,
        reply: false,
        sender: 'sender',
      };
      if (msg.message.title !== this.senderUUID) {
        this.messages.push(receivedMessage);
        this.ngxNotificationService.sendMessage(
          `New message from sender: ${msg.message.description}`,
          'info',
          'top-left'
        );
      }
    });
  }

  /**
   *
   * @param event : Event which contains message data
   * @param userName : Name of sender
   * @param avatar : Avatat of sender
   * @returns
   */
  sendMessage(event: { message: string }, userName: string, avatar: string) {
    //  Restricting if the user is not in the room
    if (!this.inRoom) {
      return;
    }

    // Constructing ChatMessage object for pushing into state
    const chatMessage: ChatMessage = {
      body: event.message,
      subject: 'new message',
      toUserId: this.channelUUID,
      channelId: this.channelUUID,
      channelType: '0',
      reply: true,
      sender: userName,
    };

    // Contructing Chat Object for sending to database
    const dbMessage: Chat = {
      body: event.message,
      subject: this.senderUUID,
      toUserId: this.channelUUID,
      channelId: this.channelUUID,
      channelType: '0',
    };

    // Posting message to backend via API
    this.userHttpService.post(dbMessage, this.token).subscribe((response) => {
      this.messages.push(chatMessage);
    });
  }
}
