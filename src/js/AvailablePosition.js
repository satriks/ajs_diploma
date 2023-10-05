export default class AvailablePosition {
  constructor() {
    this.matrix = [];
    this.availablePositionToMove = [];
    this.availablePositionToAttack = [];
    this.classMoveRage = {
      swordsman: 4,
      bowman: 2,
      magician: 1,
      daemon: 1,
      undead: 4,
      vampire: 2,

    };
    this.classAttackRange = {
      swordsman: 1,
      bowman: 2,
      magician: 4,
      daemon: 4,
      undead: 1,
      vampire: 2,

    };

    for (const i of Array.from(Array(8).keys())) {
      this.matrix[i] = [];
      for (const j of Array.from(Array(8).keys())) {
        this.matrix[i][j] = (8 * i) + j;
      }
    }
  }

  getMovePosition(currentPosition, classType) {
    const range = this.classMoveRage[classType];
    const row = Math.floor(currentPosition / 8);
    const column = currentPosition % 8;
    this.availablePositionToMove = [];

    for (let i = -range; i <= range; i += 1) {
      if (column + i >= 0 && column + i < 8) {
        this.availablePositionToMove.push(this.matrix[row][column + i]);
      }
      if (row + i >= 0 && row + i < 8) {
        this.availablePositionToMove.push(this.matrix[row + i][column]);
      }

      if (row - i >= 0 && row - i < 8 && column + i < 8 && column + i >= 0) {
        this.availablePositionToMove.push(this.matrix[row - i][column + i]);
      }

      if (row + i >= 0 && row + i < 8 && column + i < 8 && column + i >= 0) {
        this.availablePositionToMove.push(this.matrix[row + i][column + i]);
      }
    }
    this.availablePositionToMove = Array.from(new Set(this.availablePositionToMove));
    this.availablePositionToMove = this.availablePositionToMove.filter((el) => el !== currentPosition);

    return this.availablePositionToMove;
  }

  getAttackPosition(currentPosition, classType) {
    const range = this.classAttackRange[classType];
    const row = Math.floor(currentPosition / 8);
    const column = currentPosition % 8;
    this.availablePositionToAttack = [];

    const topLeft = [row - range, column - range].map((el) => {
      if (el < 0) { return 0; }
      if (el > 7) { return 7; }
      return el;
    });
    const bottomRight = [row + range, column + range].map((el) => {
      if (el < 0) { return 0; }
      if (el > 7) { return 7; }
      return el;
    });
    for (let i = topLeft[0]; i <= bottomRight[0]; i += 1) {
      for (let j = topLeft[1]; j <= bottomRight[1]; j += 1) {
        this.availablePositionToAttack.push(this.matrix[i][j]);
      }
    }

    this.availablePositionToAttack = this.availablePositionToAttack.filter((el) => el !== currentPosition);
    return this.availablePositionToAttack;
  }
}
