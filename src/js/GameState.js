export default class GameState {
  constructor() {
    this.counter = 0;
    this.level = 0
    this.levelName = {
      0: 'prairie',
      1: 'desert',
      2: 'arctic',
      3: 'mountain',
    };
    this.turn = null;
    // prairie -> desert -> arctic -> mountain
  }

  /* eslint-disable */
  static from(object) {
    // TODO: create object
    return null;
  }

  /* eslint-enable */
  getTurn() {
    this.counter += 1;
    this.counter % 2 ? this.turn = 'player' : this.turn = 'ai'; // eslint-disable-line
    return this.turn;
  }
  getLevel(){
    return this.levelName[this.level]
  }
}
