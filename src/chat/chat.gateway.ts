import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');

  handleConnection(client: Socket) {
    this.logger.log(`New user joined the chat: ${client.id}`);

    // Envoie le message à tous les clients sauf celui qui vient de se connecter
    client.broadcast.emit('user-joined', {
      message: `New user joined the chat: ${client.id}`,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`User ${client.id} left the chat`);

    // Envoie le message à tous les clients sauf celui qui vient de se déconnecter
    this.server.emit('user-left', {
      message: `User ${client.id} left the chat`,
    });
  }

  @SubscribeMessage('newMessage')
  handleNewMessage(client: Socket, message: any) {
    console.log('newMessage', message);

    client.emit('reply', 'this is a reply');

    this.server.emit('reply', 'diffusion');
  }
}
