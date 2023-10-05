import GamePlay from './GamePlay';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import { getTooltip } from './utils';
import cursor from './cursors';
import AvailablePosition from './AvailablePosition';
import AI from './AiModule';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.currentCharactersPosition = [];
    this.charSelected = null;
    this.availablePosition = new AvailablePosition();
    this.positionToMove = null;
    this.positionToAttack = null;
    this.ai = new AI();
    this.level = 0;
    this.gameStatus = 'play';
    this.tets = '4242' // тест
  }

  init() {
    this.gamePlay.drawUi(this.gameState.levelName[this.level]);
    if (this.currentCharactersPosition.length < 1) {
      this.getStartPosition();
    }
    this.gamePlay.redrawPositions(this.currentCharactersPosition);

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addNewGameListener(this.getNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  onCellClick(index) {
    this.checkTeam();
    if (this.gameStatus !== 'stop') {
      if (this.gamePlay.cells[index].childNodes.length) {
        const char = this.currentCharactersPosition.filter((el) => el.position === index)[0];
        // Добрый персонаж
        if (['swordsman', 'magician', 'bowman'].includes(char.character.type)) {
          if (this.charSelected) {
            this.gamePlay.deselectCell(this.charSelected.position);
            this.positionToAttack = null;
            this.positionToMove = null;
          }

          this.gamePlay.selectCell(index);
          this.charSelected = char;
          const blockPosition = this.currentCharactersPosition.map((el) => el.position);
          // eslint-disable-next-line
          this.positionToMove = this.availablePosition.getMovePosition(this.charSelected.position, this.charSelected.character.type).filter((el) => !blockPosition.includes(el));
          this.positionToAttack = this.availablePosition.getAttackPosition(this.charSelected.position, this.charSelected.character.type);
        }
        // Злой персонаж
        if (['undead', 'vampire', 'daemon'].includes(char.character.type)) {
          if (this.charSelected && this.positionToAttack.includes(index)) {
            const target = this.currentCharactersPosition.filter((el) => el.position === index);
            // eslint-disable-next-line
            const damage = Math.max(this.charSelected.character.attack - target[0].character.defence, this.charSelected.character.attack * 0.1);
            this.gamePlay.showDamage(index, damage)
              .then(() => {
                target[0].character.health -= damage;

                if (target[0].character.health <= 0) {
                  this.characterDeath(target[0]);
                }
                this.gamePlay.deselectCell(index);
              })
              .then(() => {
                this.gamePlay.redrawPositions(this.currentCharactersPosition);
                this.enemyTurn();
              });
          } else { GamePlay.showError('Это не персонаж игрока'); }
        }
        // Нет персонажа
      } else if (this.charSelected && this.positionToMove.includes(index)) {
        this.gamePlay.deselectCell(this.charSelected.position);
        this.gamePlay.deselectCell(index);
        this.charSelected.position = index;

        this.gamePlay.redrawPositions(this.currentCharactersPosition);
        this.charSelected = null;
        this.enemyTurn();
      }
    }
  }

  onCellEnter(index) {
    this.checkTeam();
    if (this.gameStatus !== 'stop') {
      if (this.gamePlay.cells[index].childNodes.length) {
        const message = getTooltip(this.currentCharactersPosition.filter((el) => el.position === index)[0].character);

        const char = this.currentCharactersPosition.filter((el) => el.position === index);
        // Добрый персонаж
        if (['swordsman', 'magician', 'bowman'].includes(char[0].character.type)) {
          this.gamePlay.setCursor(cursor.pointer);
        }
        this.gamePlay.showCellTooltip(message, index);
      }

      if (this.charSelected) {
        if (this.gamePlay.cells[index].childNodes.length) {
          const charEnemyClass = this.currentCharactersPosition.filter((el) => el.position === index)[0].character.type;
          // Враг
          if (['undead', 'vampire', 'daemon'].includes(charEnemyClass)) {
            if (this.positionToAttack.includes(index)) {
              this.gamePlay.setCursor(cursor.crosshair);
              this.gamePlay.selectCell(index, 'red');
            } else {
              this.gamePlay.setCursor(cursor.notallowed);
            }
          }
        }
        // Варианты хода
        if (this.positionToMove.includes(index)) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursor.pointer);
        }
      }
    }
  }

  onCellLeave(index) {
    this.checkTeam();

    if (this.gameStatus !== 'stop') {
      this.gamePlay.hideCellTooltip(index);
      this.gamePlay.setCursor('auto');
      if (this.charSelected) {
        if (this.charSelected.position !== index) {
          this.gamePlay.deselectCell(index);
        }
      }
    }
  }
  /* eslint-disable */
  getRandomPosition(arr, count) {
    const res = [];
    const availablePos = [];

    for (const ind of arr) {
      for (let i = 0; i < 8; i += 1) {
        availablePos.push((i * 8) + ind);
      }
    }
    for (let j = 0; j < count; j += 1) {
      const index = Math.floor(Math.random() * availablePos.length);
      res.push(Math.floor(availablePos.splice(index, 1)));
    }
    return res;
  }
  /* eslint-enable */

  getEvilTeam() {
    const evilHeroes = [Daemon, Vampire, Undead];
    const evilTeam = generateTeam(evilHeroes, 4, 3);
    let evilPosition = [];

    while (evilPosition.length !== 3) {
      evilPosition = this.getRandomPosition([6, 7], 3);
      const blockPosition = this.currentCharactersPosition.map((el) => el.position);
      evilPosition = evilPosition.filter((el) => !blockPosition.includes(el));
    }

    const evilTeamPositions = evilTeam.characters.map((el) => new PositionedCharacter(el, evilPosition.pop()));
    return evilTeamPositions;
  }

  getGoodTeam() {
    const goodHeroes = [Swordsman, Magician, Bowman];
    const goodTeam = generateTeam(goodHeroes, 4, 3);
    const goodPosition = this.getRandomPosition([0, 1], 3);
    const goodTeamPositions = goodTeam.characters.map((el) => new PositionedCharacter(el, goodPosition.pop()));
    return goodTeamPositions;
  }

  getStartPosition() {
    this.goodTeam = this.getGoodTeam();
    this.evilTeam = this.getEvilTeam();
    this.currentCharactersPosition = [...this.goodTeam, ...this.evilTeam];
  }

  levelUp(heros = this.currentCharactersPosition) {
    let heroes = heros;
    if (heroes.constructor === PositionedCharacter) {
      heroes = [heros];
    }
    /* eslint-disable no-param-reassign */
    heroes.forEach((hero) => {
      if (hero.character.level <= 3) {
        hero.character.level += 1;
        hero.character.health += 80;
        if (hero.character.health > 100) {
          hero.character.health = 100;
        }
        const attackAfter = Math.max(hero.character.attack, (hero.character.attack * (80 + hero.character.health)) / 100);
        hero.character.attack = attackAfter;
        const defenseAfter = Math.max(hero.character.defence, (hero.character.defence * (80 + hero.character.health)) / 100);
        hero.character.defence = defenseAfter;
      }
    });
  }
  /* eslint-enable */

  levelUpAll() {
    this.level += 1;
    if (this.level > 3) {
      // eslint-disable-next-line
      alert('Победа!');
      this.gameStatus = 'stop';
      return;
    }
    this.levelUp(this.currentCharactersPosition);

    this.gamePlay.drawUi(this.gameState.levelName[this.level]);
    this.evilTeam = this.getEvilTeam();
    this.currentCharactersPosition = [...this.currentCharactersPosition, ...this.evilTeam];
    this.gamePlay.redrawPositions(this.currentCharactersPosition);
  }

  characterDeath(char) {
    this.currentCharactersPosition = this.currentCharactersPosition.filter((el) => el.position !== char.position);
    this.goodTeam = this.goodTeam.filter((el) => el.position !== char.position);
    this.evilTeam = this.evilTeam.filter((el) => el.position !== char.position);
    this.gamePlay.redrawPositions(this.currentCharactersPosition);
  }

  enemyTurn() {
    this.checkTeam();
    if (this.gameStatus !== 'stop') {
      // ход противника
      const turn = this.ai.turn(this.currentCharactersPosition);
      if (turn.type === 'attack') {
        const [index, damage] = [...turn.data];
        this.gamePlay.showDamage(index, damage)
          .then(() => {
            const target = this.currentCharactersPosition.filter((el) => el.position === index);
            target[0].character.health -= damage;
            if (target[0].character.health <= 0) {
              this.characterDeath(target[0]);
              this.charSelected = null;
            }
            this.gamePlay.deselectCell(index);
          })
          .then(() => { this.gamePlay.redrawPositions(this.currentCharactersPosition); });
      }
      if (turn.type === 'move') {
        const [charm] = this.currentCharactersPosition.filter((el) => el === turn.data[1]);
        // eslint-disable-next-line
        charm.position = turn.data[0];
        this.gamePlay.redrawPositions(this.currentCharactersPosition);
        this.updateTeam();
      }
    }
  }

  getNewGame() {
    this.gameState = null;
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.newGameListeners = [];

    this.gameState = new GameState();
    this.currentCharactersPosition = [];
    this.charSelected = null;
    this.availablePosition = new AvailablePosition();
    this.positionToMove = null;
    this.positionToAttack = null;
    this.ai = new AI();
    this.level = 0;
    this.gameStatus = 'play';
    this.init();
  }

  onSaveGame() {
    this.stateService.save({ ...this });
  }

  onLoadGame() {
    try {
      const data = this.stateService.load();

      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
      this.gamePlay.newGameListeners = [];

      this.currentCharactersPosition = data.currentCharactersPosition;
      this.evilTeam = data.evilTeam;
      this.goodTeam = data.goodTeam;
      this.charSelected = data.charSelected;
      this.positionToMove = data.positionToMove;
      this.positionToAttack = data.positionToAttack;
      this.level = data.level;
      this.gameStatus = data.gameStatus;

      this.init();
    } catch (err) {
      GamePlay.showError(err);
    }
  }

  checkTeam() {
    if (this.gameStatus !== 'stop') {
      if (this.evilTeam.length === 0) {
        this.levelUpAll();
      }

      if (this.goodTeam.length === 0) {
        this.gameStatus = 'stop';
      }
    }
  }

  updateTeam() {
    this.evilTeam = this.currentCharactersPosition.filter((el) => ['undead', 'vampire', 'daemon'].includes(el.character.type));
    this.goodTeam = this.currentCharactersPosition.filter((el) => ['swordsman', 'magician', 'bowman'].includes(el.character.type));
  }
}
