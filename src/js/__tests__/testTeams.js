import Team from '../Team';
import { characterGenerator } from '../generators';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Bowman from '../characters/Bowman';

test('Team test', () => {
  const allowedTypes = [Swordsman, Magician, Bowman];
  const teamGenerator = characterGenerator(allowedTypes, 4);
  const teammate = [teamGenerator.next().value, teamGenerator.next().value, teamGenerator.next().value];
  const team = new Team(teammate);
  expect(team.characters.length).toBe(3);
});
