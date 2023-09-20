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
import AvailablePosition from './AvaliblePosition';
import AI from './AiModule';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.gameState = new GameState();
    this.stateService = stateService;
    this.currentCharactersPosition = [];
    this.charSelected = null;
    this.availablePosition = new AvailablePosition();
    this.positionToMove = null;
    this.positionToAttack = null;
    this.ai = new AI();
    this.level = 0;
    this.gameStatus = 'play';
  }
  // TODO
  // исчезновение отрисовки значка поля
  // выбор для атаки на текущую позицию
  // ошибка с пустой нодой
  //

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

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    console.log('click click');
    console.log(this.gamePlay.cells[index].childNodes.length);
    this.checkTeam();
    if (this.gameStatus !== 'stop') {
      // есть ли персонаж
      if (this.gamePlay.cells[index].childNodes.length) {
        const char = this.currentCharactersPosition.filter((el) => el.position === index)[0];
        console.log(char, 'its char from clivk');
        console.log(index);
        console.log((char.character.type));
        // Да , добрый ?
        if (['swordsman', 'magician', 'bowman'].includes(char.character.type)) {
          // Выбран ?
          console.log('дошло сюда');
          if (this.charSelected) {
            this.gamePlay.deselectCell(this.charSelected.position);
            this.positionToAttack = null;
            this.positionToMove = null;
          }

          this.gamePlay.selectCell(index);
          this.charSelected = char;
          const blockPosition = this.currentCharactersPosition.map((el) => el.position);
          this.positionToMove = this.availablePosition.getMovePosition(this.charSelected.position, this.charSelected.character.type).filter((el) => !blockPosition.includes(el));
          this.positionToAttack = this.availablePosition.getAttackPosition(this.charSelected.position, this.charSelected.character.type);
        }
        // Да, злой ?
        if (['undead', 'vampire', 'daemon'].includes(char.character.type)) {
          // выбран герой и в рендже
          console.log('а сюда');
          if (this.charSelected && this.positionToAttack.includes(index)) {
            const target = this.currentCharactersPosition.filter((el) => el.position === index);
            // const damage = this.charSelected.character.attack

            const damage = Math.max(this.charSelected.character.attack - target[0].character.defence, this.charSelected.character.attack * 0.1);
            this.gamePlay.showDamage(index, damage)
              .then(() => {
                target[0].character.health -= damage;
                console.log(target[0], 'цель');
                if (target[0].character.health <= 0) {
                  console.log('убит');
                  this.characterDeath(target[0]);
                }
              })
              .then(() => {
                this.gamePlay.redrawPositions(this.currentCharactersPosition);
                this.enemyTern();
              });
          } else { GamePlay.showError('Это не персонаж игрока'); }
        }
      } else if (this.charSelected && this.positionToMove.includes(index)) {
        this.gamePlay.deselectCell(this.charSelected.position);
        this.gamePlay.deselectCell(index);
        this.charSelected.position = index;

        this.gamePlay.redrawPositions(this.currentCharactersPosition);
        this.charSelected = null;
        console.log('Дижение');
        this.enemyTern();
      }

      // if (this.evilTeam.length == 0){
      //   this.levelUpAll()
      // }

      // if (this.goodTeam.length == 0){
      //   this.gameStatus = 'stop'
      // }
    }
  }

  onCellEnter(index) {
    this.checkTeam();
    if (this.gameStatus !== 'stop') {
      // есть персонаж в ноде
      if (this.gamePlay.cells[index].childNodes.length) {
        const message = getTooltip(this.currentCharactersPosition.filter((el) => el.position === index)[0].character);

        const char = this.currentCharactersPosition.filter((el) => el.position === index);
        // да, Добрый ?
        if ([Swordsman, Magician, Bowman].includes(char[0].character.constructor)) {
          this.gamePlay.setCursor(cursor.pointer);
        }
        this.gamePlay.showCellTooltip(message, index);
      }

      // персонаж выбран
      if (this.charSelected) {
        // в ноде есть персонаж ?
        if (this.gamePlay.cells[index].childNodes.length) {
          const charEnemyClass = this.currentCharactersPosition.filter((el) => el.position === index)[0].character.constructor;
          // Это враг ?
          if ([Daemon, Vampire, Undead].includes(charEnemyClass)) {
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

    // TODO: react to mouse enter
    }
  }

  onCellLeave(index) {
    this.checkTeam();

    if (this.gameStatus !== 'stop') {
      // TODO: react to mouse leave
      this.gamePlay.hideCellTooltip(index);
      this.gamePlay.setCursor('auto');
      if (this.charSelected) {
        if (this.charSelected.position !== index) {
          this.gamePlay.deselectCell(index);
        }
      }
    }
  }

  getRandoomPosition(arr, count) {
    const res = [];
    const avaliblePos = [];

    for (const ind of arr) {
      for (let i = 0; i < 8; i += 1) {
        avaliblePos.push((i * 8) + ind);
      }
    }
    for (let j = 0; j < count; j += 1) {
      const index = Math.floor(Math.random() * avaliblePos.length);
      res.push(Math.floor(avaliblePos.splice(index, 1)));
    }
    return res;
  }

  getEvilTeam() {
    const evilHeroes = [Daemon, Vampire, Undead];
    const evilTeam = generateTeam(evilHeroes, 4, 3);
    const evilPosition = this.getRandoomPosition([6, 7], 3);
    const evilTeamPositions = evilTeam.characters.map((el) => new PositionedCharacter(el, evilPosition.pop()));
    console.log(evilTeamPositions);
    return evilTeamPositions;
  }

  getGoodTeam() {
    const goodHeroes = [Swordsman, Magician, Bowman];
    const goodTeam = generateTeam(goodHeroes, 4, 3);
    const goodPosition = this.getRandoomPosition([0, 1], 3);
    const goodTeamPositions = goodTeam.characters.map((el) => new PositionedCharacter(el, goodPosition.pop()));
    console.log(goodTeamPositions);
    return goodTeamPositions;
  }

  getStartPosition() {
    this.goodTeam = this.getGoodTeam();
    this.evilTeam = this.getEvilTeam();
    this.currentCharactersPosition = [...this.goodTeam, ...this.evilTeam];
    // this.gamePlay.redrawPositions([ ...this.currentCharactersPosition]);
  }

  levelUp(heros = this.currentCharactersPosition) {
    let heroes = heros;
    if (heroes.constructor === PositionedCharacter) {
      heroes = [heros];
    }
    // if (heroes[0].constructor == PositionedCharacter){
    //   console.log('это массив ');
    //   console.log(heroes[0]);
    // }
    console.log(heroes.constructor), ' это конст класаа';
    console.log(heroes, 'герои');

    heroes.forEach((element) => {
      if (element.character.level <= 3) {
        element.character.level += 1;
        element.character.health += 80;
        if (element.character.health > 100) {
          element.character.health = 100;
        }
        const attackAfter = Math.max(element.character.attack, (element.character.attack * (80 + element.character.health)) / 100);
        element.character.attack = attackAfter;
        const defencekAfter = Math.max(element.character.defence, (element.character.defence * (80 + element.character.health)) / 100);
        element.character.defence = defencekAfter;
      }
    });
  }

  levelUpAll() {
    this.level += 1;
    if (this.level > 3) {
      alert('Победа!');
      this.gameStatus = 'stop';
      return;
    }
    this.levelUp(this.currentCharactersPosition);
    // console.log('это 2 запуск');
    // this.levelUp(this.currentCharactersPosition[0])
    // this.currentCharactersPosition.forEach((el) => {
    //   if (el.character.level <= 3){

    //     el.character.level += 1
    //     el.character.health += 80
    //     if (el.character.health > 100) {
    //       el.character.health = 100
    //     }
    //     const attackAfter = Math.max(el.character.attack, el.character.attack * (80 + el.character.health) / 100)
    //     el.character.attack = attackAfter
    //     const defencekAfter = Math.max(el.character.defence, el.character.defence * (80 + el.character.health) / 100)
    //     el.character.defence = defencekAfter
    //   }

    // })

    this.gamePlay.drawUi(this.gameState.levelName[this.level]);
    // (prairie -> desert -> arctic -> mountain
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

  enemyTern() {
    this.checkTeam();
    if (this.gameStatus !== 'stop') {
      // [ход противника]
      const tern = this.ai.tern(this.currentCharactersPosition);
      if (tern.type === 'attack') {
        const [index, damage] = [...tern.data];
        // const damage = tern.data[1]
        // console.log(ind, 'fffff');
        this.gamePlay.showDamage(index, damage)
          .then(() => {
            const target = this.currentCharactersPosition.filter((el) => el.position === index);
            target[0].character.health -= damage;
            if (target[0].character.health <= 0) {
              this.characterDeath(target[0]);
            }
          })
        // console.log(target);} )
          .then(() => { this.gamePlay.redrawPositions(this.currentCharactersPosition); });
      }
      if (tern.type === 'move') {
        console.log(tern.data, ' its data');
        const charm = this.currentCharactersPosition.filter((el) => el === tern.data[1]);
        charm[0].position = tern.data[0];
        this.gamePlay.redrawPositions(this.currentCharactersPosition);
      }
    }
  }

  getNewGame() {
    this.gameState = null;
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.newGameListeners = [];
    // this.gamePlay = gamePlay;
    this.gameState = new GameState();
    // this.stateService = stateService;
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
      const datas = this.stateService.load();

      console.log(datas.evilTeam, ' its datas');
      // console.log(this.gamePlay.cellClickListeners);
      // console.log(this.gamePlay.cellEnterListeners, 'utqv gktq');
      // console.log(datas.gamePlay.cellClickListeners, ' is data');
      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
      this.gamePlay.newGameListeners = [];
      // this.gamePlay = gamePlay;
      // this.gameState = new GameState()
      // this.stateService = stateService;
      this.currentCharactersPosition = datas.currentCharactersPosition;
      this.evilTeam = datas.evilTeam;
      this.goodTeam = datas.goodTeam;
      this.charSelected = datas.charSelected;
      // this.availablePosition = new AvailablePosition();
      this.positionToMove = datas.positionToMove;
      this.positionToAttack = datas.positionToAttack;
      // this.ai = new AI()
      this.level = datas.level;
      this.gameStatus = datas.gameStatus;

      // for (let item in datas){

      //   // console.log(item);
      //   // console.log(this.item);
      //   this[item]= datas[item]

      //   }
      // console.log(this['gamePlay'], 'after');
      // console.log(this['gamePlay'].drawUi, 'after');

      this.init();

      // console.log(this.gamePlay.cellClickListeners);
      // console.log(this.gamePlay.cellEnterListeners, 'utqv gktq');
      // console.log(datas.gamePlay.cellClickListeners, ' is data');
      console.log(this.charSelected);
      console.log(this.goodTeam);
      console.log(this.gameStatus);
    // console.log('тут');
    // console.log(this.currentCharactersPosition);
    // console.log(this.gamePlay);
    // console.log(this.gamePlay.redrawPositions);
    // this.gamePlay.redrawPositions([ ...this.currentCharactersPosition])
    // this.gamePlay.redrawPositions(this.currentCharactersPosition)
    } catch (err) {
      GamePlay.showError(err);
    }
  }

  checkTeam() {
    if (this.gameStatus !== 'stop') {
      // console.log('check team', 'злая :', this.evilTeam, 'гейм статус :', this.gameStatus);
      if (this.evilTeam.length === 0) {
        this.levelUpAll();
      }

      if (this.goodTeam.length === 0) {
        this.gameStatus = 'stop';
      }
    }
  }
}
