export default class GameState {
  constructor() {
    this.tern = 0;
  }

  static from(object) {
    // TODO: create object
    return null;
  }

  getTern() {
    this.tern += 1;
    return this.tern % 2 ? 'player' : 'ai';
  }
}
