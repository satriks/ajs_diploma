export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(data) {
    this.storage.setItem('state', '');
    this.storage.setItem('state', JSON.stringify(data));
  }

  load() {
    try {
      return JSON.parse(this.storage.getItem('state'));
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
