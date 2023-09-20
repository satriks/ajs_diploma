export default class GameState {
  constructor() {
    this.counter = 0;
    this.levelName = {
      0: 'prairie',
      1: 'desert',
      2: 'arctic',
      3: 'mountain',
    };
    this.tern = null;
    // prairie -> desert -> arctic -> mountain
  }

  static from(object) {
    // TODO: create object
    return null;
  }

  getTern() {
    this.counter += 1;
    return this.counter % 2 ? this.tern = 'player' : this.tern = 'ai';
  }
}
