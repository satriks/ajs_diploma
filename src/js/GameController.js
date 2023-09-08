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

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentCharactersPosition = [];
    this.charSelected = null;
    this.availablePosition = new AvailablePosition();
    this.positionToMove = null
    this.positionToAttack = null
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.getStartPosition();

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    if (this.gamePlay.cells[index].childNodes.length) {
      const char = this.currentCharactersPosition.filter((el) => el.position === index)[0];
      if ([Swordsman, Magician, Bowman].includes(char.character.constructor)) {
        if (this.charSelected) {
          this.gamePlay.deselectCell(this.charSelected.position);
          this.positionToAttack = null
          this.positionToMove = null
        }

        this.gamePlay.selectCell(index);
        this.charSelected = char;
        const blockPosition = this.currentCharactersPosition.map((el) => el.position);
        this.positionToMove = this.availablePosition.getMovePosition(this.charSelected.position, this.charSelected.character.type).filter((el) => !blockPosition.includes(el));
        this.positionToAttack = this.availablePosition.getAttackPosition(this.charSelected.position, this.charSelected.character.type);
        console.log(this.positionToAttack, this.positionToMove, 'positions ');
      } 
      else { GamePlay.showError('Это не персонаж игрока'); }
    } 
    else {
      if (this.positionToMove.includes(index)){

        this.gamePlay.deselectCell(this.charSelected.position)
        this.gamePlay.deselectCell(index)
        this.charSelected.position = index

        this.gamePlay.redrawPositions(this.currentCharactersPosition)
        this.charSelected = null
        // Добавить переход хода
      }
    }

  }

  onCellEnter(index) {
    if (this.gamePlay.cells[index].childNodes.length) {
      const message = getTooltip(this.currentCharactersPosition.filter((el) => el.position === index)[0].character);

      const char = this.currentCharactersPosition.filter((el) => el.position === index);
      if ([Swordsman, Magician, Bowman].includes(char[0].character.constructor)) {
        this.gamePlay.setCursor(cursor.pointer);
      }

      this.gamePlay.showCellTooltip(message, index);
    }
    if (this.charSelected) {
      if (this.gamePlay.cells[index].childNodes.length) {
        const charEnemyClass = this.currentCharactersPosition.filter((el) => el.position === index)[0].character.constructor;
        if ([Daemon, Vampire, Undead].includes(charEnemyClass)) {
          if (this.positionToAttack.includes(index)) {
            this.gamePlay.setCursor(cursor.crosshair);
            this.gamePlay.selectCell(index, 'red');
          } else {
            this.gamePlay.setCursor(cursor.notallowed);
          }
        }
      }

      if (this.positionToMove.includes(index)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursor.pointer);
      }
    }

    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor('auto');
    if (this.charSelected) {
      if (this.charSelected.position !== index) {
        this.gamePlay.deselectCell(index);
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

  getStartPosition() {
    const goodHeroes = [Swordsman, Magician, Bowman];
    const badHeroes = [Daemon, Vampire, Undead];

    const goodTeam = generateTeam(goodHeroes, 4, 3);
    const badTeam = generateTeam(badHeroes, 4, 3);

    const goodPosition = this.getRandoomPosition([0, 1], 3);
    const badPosition = this.getRandoomPosition([3, 7], 3);

    const goodTeamPositions = goodTeam.characters.map((el) => new PositionedCharacter(el, goodPosition.pop()));
    const badTeamPositions = badTeam.characters.map((el) => new PositionedCharacter(el, badPosition.pop()));
    this.currentCharactersPosition = [...goodTeamPositions, ...badTeamPositions];
    this.gamePlay.redrawPositions([...goodTeamPositions, ...badTeamPositions]);
  }

}
