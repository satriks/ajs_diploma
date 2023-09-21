import AvailablePosition from './AvaliblePosition';

export default class AI {
  constructor() {
    this.currentCharacters = null;
    this.goodTeam = null;
    this.evilTeam = null;

    this.available = new AvailablePosition();
    this.demagelist = [];
  }

  tern(team) {
    this.#updateStatusTeam(team);
    this.getAvailableAttack();

    this.demagelist = this.demagelist.sort((a, b) => b[1] - a[1]);
    if (this.demagelist.length > 0) {
      return { data: this.demagelist[0], type: 'attack' };
    }
    return { data: this.getAvailableMove(), type: 'move' };
  }

  // обновляет состояние команд
  #updateStatusTeam(team) {
    this.currentCharacters = team;
    this.goodTeam = this.currentCharacters.filter((el) => ['swordsman', 'bowman', 'magician'].includes(el.character.type));
    this.evilTeam = this.currentCharacters.filter((el) => ['undead', 'vampire', 'daemon'].includes(el.character.type));
  }

  // получение вариантов атаки
  getAvailableAttack() {
    this.demagelist = [];
    this.evilTeam.forEach((badHero) => {
      const agr = this.available.getAttackPosition(badHero.position, badHero.character.type);
      const heros = this.goodTeam.filter((el) => agr.includes(el.position));
      heros.forEach((goodHero) => {
        const demage = Math.max(badHero.character.attack - goodHero.character.defence, badHero.character.attack * 0.1);
        this.demagelist.push([goodHero.position, demage]);
      });
    });
  }

  // варианты перемещеиня
  getAvailableMove() {
    if (this.evilTeam.length > 0) {
      const indexChar = Math.floor(Math.random() * this.evilTeam.length);
      const char = this.evilTeam[indexChar];
      let move = this.available.getMovePosition(char.position, char.character.type);
      const blockPosition = this.currentCharacters.map((el) => el.position);
      move = move.filter((el) => !blockPosition.includes(el));
      return [move[Math.floor(Math.random() * move.length)], char];
    }
    return [];
  }
}
