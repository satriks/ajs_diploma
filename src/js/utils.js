/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType (index, boardSize) {
  if (index >= boardSize * boardSize) {
    throw new Error('Index out of range')
  }

  switch (index) {
    case 0:
      return 'top-left'

    case boardSize - 1:
      return 'top-right'

    case (boardSize * (boardSize - 1)):
      return 'bottom-left'

    case ((boardSize * boardSize) - 1):
      return 'bottom-right'

    default:

      if (index > 0 && index < (boardSize - 1)) {
        return 'top'
      } if (index > (boardSize * (boardSize - 1)) && index < (boardSize * boardSize) - 1) {
        return 'bottom'
      } if ((index % boardSize) === (boardSize - 1) && index !== ((boardSize * boardSize) - 1)) {
        return 'right'
      } if ((index % boardSize) === 0 && index !== (boardSize * (boardSize - 1))) {
        return 'left'
      }
  }

  return 'center'
}

export function calcHealthLevel (health) {
  if (health < 15) {
    return 'critical'
  }

  if (health < 50) {
    return 'normal'
  }

  return 'high'
}

export function getTooltip (char) {
  return `🎖${char.level} ⚔${char.attack} 🛡${char.defence} ❤${char.health}`
}
