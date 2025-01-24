import { EventEmitter } from 'events';
import { logController } from '../controllers/LogController';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20);
  }

  emit(event: string, ...args: any[]) {
    logController.addLog('info', `Event tetiklendi: ${event}`);
    return super.emit(event, ...args);
  }
}

export const eventBus = new EventBus();

export const EVENT_TYPES = {
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_SENT: 'message:sent',
  BOT_STATUS_CHANGED: 'bot:status_changed',
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  ERROR_OCCURRED: 'error:occurred',
  AI_ASSISTANT_RESPONSE: 'ai:response',
  AI_ASSISTANT_ACTION: 'ai:action',
  PANEL_UPDATED: 'panel:updated'
};