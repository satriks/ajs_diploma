import { characterGenerator, generateTeam } from '../generators'
import Swordsman from '../characters/Swordsman'
import Magician from '../characters/Magician'
import Bowman from '../characters/Bowman'

test('test gen', () => {
  const allowedTypes = [Magician, Swordsman, Bowman]
  const characterGen = characterGenerator(allowedTypes, 4)
  characterGen.next().value; // eslint-disable-line
  characterGen.next().value; // eslint-disable-line
  characterGen.next().value; // eslint-disable-line
  characterGen.next().value; // eslint-disable-line

  const character = characterGen.next().value

  expect([Magician, Swordsman, Bowman]).toContain(character.constructor)
})

test('test generateTeam', () => {
  const allowedTypes = [Magician, Swordsman, Bowman]
  const team = generateTeam(allowedTypes, 4, 30)
  const teamLevel = team.characters.map((el) => el.level)
  expect(Math.max(...teamLevel)).toBeLessThan(5)
  expect(Math.min(...teamLevel)).toBeGreaterThanOrEqual(1)
})
