import Character from '../Character';
import Swordsman from '../characters/Swordsman';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

test('test error new Character', () => {
  expect(() => new Character(2).toThrow(Error));
});

test.each([
  ['Swordsman', new Swordsman(1)],
  ['Bowman', new Bowman(1)],
  ['Magician', new Magician(1)],
  ['Daemon', new Daemon(1)],
  ['Undead', new Undead(1)],
  ['Vampire', new Vampire(1)],
])(
  ('test %s'),
  (name, hero) => {
    // console.log(hero);
    expect(hero.constructor.name).toEqual(name);
  },
);
test.each([
  ['Swordsman', new Swordsman(1), 40],
  ['Bowman', new Bowman(1), 25],
  ['Magician', new Magician(1), 10],
  ['Daemon', new Daemon(1), 10],
  ['Undead', new Undead(1), 40],
  ['Vampire', new Vampire(1), 25],
])(
  ('test attack %s'),
  (name, hero, attack) => {
    // console.log(hero);
    expect(hero.attack).toEqual(attack);
  },
);
test.each([
  ['Swordsman', new Swordsman(1), 10],
  ['Bowman', new Bowman(1), 25],
  ['Magician', new Magician(1), 40],
  ['Daemon', new Daemon(1), 10],
  ['Undead', new Undead(1), 10],
  ['Vampire', new Vampire(1), 25],
])(
  ('test defence %s'),
  (name, hero, defence) => {
    // console.log(hero);
    expect(hero.defence).toEqual(defence);
  },
);

test('test', () => {
  const hero = new Swordsman(3);
  expect(hero.level).toBe(3);
});
