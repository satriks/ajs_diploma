import AvailablePosition from './AvailablePosition'

export default class AI {
  constructor () {
    this.goodTeam = null
    this.evilTeam = null

    this.available = new AvailablePosition()
    this.damageList = []
  }

  turn (goodTeam, evilTeam) {
    this.goodTeam = goodTeam.characters
    this.evilTeam = evilTeam.characters
    this.getAvailableAttack()

    this.damageList.sort((a, b) => b[1] - a[1])
    if (this.damageList.length > 0) {
      return { data: this.damageList[0], type: 'attack' }
    }
    return { data: this.getAvailableMove(), type: 'move' }
  }

  // получение вариантов атаки
  getAvailableAttack () {
    this.damageList = []
    this.evilTeam.forEach((badHero) => {
      const agr = this.available.getAttackPosition(badHero.position, badHero.character.type)
      const heros = this.goodTeam.filter((el) => agr.includes(el.position))
      heros.forEach((goodHero) => {
        const damage = Math.max(badHero.character.attack - goodHero.character.defence, badHero.character.attack * 0.1)
        this.damageList.push([goodHero.position, damage])
      })
    })
  }

  // варианты перемещения
  getAvailableMove () {
    if (this.evilTeam.length > 0) {
      const indexChar = Math.floor(Math.random() * this.evilTeam.length)
      const char = this.evilTeam[indexChar]
      let move = this.available.getMovePosition(char.position, char.character.type)
      const blockPosition = [...this.goodTeam, ...this.evilTeam].map((el) => el.position)
      move = move.filter((el) => !blockPosition.includes(el))
      return [move[Math.floor(Math.random() * move.length)], char]
    }
    return []
  }
}
