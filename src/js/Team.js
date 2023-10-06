import Swordsman from './characters/Swordsman'
import Magician from './characters/Magician'
import Bowman from './characters/Bowman'
import Daemon from './characters/Daemon'
import Vampire from './characters/Vampire'
import Undead from './characters/Undead'
import { generateTeam } from './generators'
import PositionedCharacter from './PositionedCharacter'

export default class Team {
  constructor (heroes) {
    this.characters = [...heroes]
  }

  levelUp () {
    this.characters.forEach((hero) => {
      if (hero.character.level <= 3) {
        hero.character.level += 1
        hero.character.health += 80
        if (hero.character.health > 100) {
          hero.character.health = 100
        }
        const attackAfter = Math.max(hero.character.attack, (hero.character.attack * (80 + hero.character.health)) / 100)
        hero.character.attack = attackAfter
        const defenseAfter = Math.max(hero.character.defence, (hero.character.defence * (80 + hero.character.health)) / 100)
        hero.character.defence = defenseAfter
      }
    })
  }

  static getGoodTeam () {
    const goodHeroes = [Swordsman, Magician, Bowman]
    const goodTeam = generateTeam(goodHeroes, 4, 3)
    const goodPosition = Team._getRandomPosition([0, 1], 3)
    const goodTeamPositions = goodTeam.characters.map((el) => new PositionedCharacter(el, goodPosition.pop()))
    return new Team(goodTeamPositions)
  }

  static getEvilTeam (blocked) {
    const evilHeroes = [Daemon, Vampire, Undead]
    const evilTeam = generateTeam(evilHeroes, 4, 3)
    let evilPosition = []

    while (evilPosition.length !== 3) {
      evilPosition = this._getRandomPosition([6, 7], 3)
      const blockPosition = blocked.characters.map((el) => el.position)
      evilPosition = evilPosition.filter((el) => !blockPosition.includes(el))
    }

    const evilTeamPositions = evilTeam.characters.map((el) => new PositionedCharacter(el, evilPosition.pop()))
    return new Team(evilTeamPositions)
  }

  static _getRandomPosition (arr, count) {
    const res = []
    const availablePos = []

    for (const ind of arr) {
      for (let i = 0; i < 8; i += 1) {
        availablePos.push((i * 8) + ind)
      }
    }
    for (let j = 0; j < count; j += 1) {
      const index = Math.floor(Math.random() * availablePos.length)
      res.push(Math.floor(availablePos.splice(index, 1)))
    }
    return res
  }
}
