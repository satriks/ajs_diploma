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
        }
        this.gamePlay.selectCell(index);
        this.charSelected = char;
      } else { GamePlay.showError('Это не персонаж игрока'); }
    }
    // const blockPosition = this.currentCharactersPosition.map((el) => el.position);

    // const positionToMove = getAveliblePosition(index, 4).filter((el) => !blockPosition.includes(el));

    // getAtackPosition(index, 2);
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
        const attackRange = this.availablePosition.getAttackPosition(this.charSelected.position, this.charSelected.character.type);
        if ([Daemon, Vampire, Undead].includes(charEnemyClass)) {
          if (attackRange.includes(index)) {
            this.gamePlay.setCursor(cursor.crosshair);
            this.gamePlay.selectCell(index, 'red');
          } else {
            this.gamePlay.setCursor(cursor.notallowed);
          }
        }
      }
      const blockPosition = this.currentCharactersPosition.map((el) => el.position);
      let PositionToMove = [64];
      PositionToMove = this.availablePosition.getMovePosition(this.charSelected.position, this.charSelected.character.type).filter((el) => !blockPosition.includes(el));

      if (PositionToMove.includes(index)) {
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

  // getAvaliblePosition(currentPosition, range){

  //   const avaliblePosition = []
  //   const row = Math.floor(currentPosition / 8)
  //   let column = currentPosition % 8

  //   console.log(currentPosition, 'cur pos')

  //   for (let i = range; i>= (-1 * range) ; i -= 1){
  //     if (i!=0){
  //       const horisontalPosition = currentPosition + i
  //       if (horisontalPosition >= row * 8 && horisontalPosition < (row + 1 ) * 8){
  //         avaliblePosition.push(horisontalPosition)
  //       }

  //       const verticalPosition = currentPosition + (8 * i)
  //       if (verticalPosition >= 0 && verticalPosition < 64){
  //         avaliblePosition.push(verticalPosition)
  //       }

  //     }

  //   }
  //   column = column + range
  //   for (let j = range; j>= (-1 * range) ; j -= 1){
  //     // console.log(column,'col dioleft');
  //     if (j !=0){
  //       const dioganalLeftPosition = currentPosition + (9 * j)
  //       if (column>=0 && column < 8 && dioganalLeftPosition >= 0 && dioganalLeftPosition < 64){
  //         avaliblePosition.push(dioganalLeftPosition)
  //       }

  //     }
  //     column -= 1
  //   }

  //   column = currentPosition % 8
  //   for (let z = 1; z <= range ; z += 1){
  //     const dioganalRightPosition = currentPosition - (7 * z)
  //     if (column < 8 && column >= 0 && dioganalRightPosition >= 0 && dioganalRightPosition < 64){
  //       avaliblePosition.push(dioganalRightPosition)
  //     }
  //     column += 1
  //     }

  //   column = currentPosition % 8
  //   for (let x = -1; x >= (-1 * range) ; x -= 1){
  //     column -= 1
  //     const dioganalRightPosition2 = currentPosition - (7 * x)
  //     if (column < 8 && column >= 0 && dioganalRightPosition2 >= 0 && dioganalRightPosition2 < 64){
  //       // console.log([dioganalRightPosition2, column, 'testdior2']);
  //       avaliblePosition.push(dioganalRightPosition2)
  //     }

  //     }
  //   return avaliblePosition
  //   }
}
