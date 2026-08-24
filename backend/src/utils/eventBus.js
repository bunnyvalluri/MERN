import { EventEmitter } from 'events';

class AppEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }
}

export const eventBus = new AppEventBus();

export const SYSTEM_EVENTS = {
  INTERNSHIP_CREATED: 'internship.created',
  INTERNSHIP_UPDATED: 'internship.updated',
  INTERNSHIP_EXPIRED: 'internship.expired',
  INTERNSHIP_REMOVED: 'internship.removed',
  SYNC_COMPLETED: 'internship.sync_completed',
};

export default eventBus;
