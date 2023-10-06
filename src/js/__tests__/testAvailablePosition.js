import AvailablePosition from '../AvailablePosition'

test.each([
  ['swordsman', 21],
  ['bowman', 13],
  ['magician', 8],
  ['daemon', 8],
  ['undead', 21],
  ['vampire', 13]

])(
  ('test move position %s'),
  (name, positions) => {
    const char = new AvailablePosition()
    expect(char.getMovePosition(33, name).length).toBe(positions)
  }
)

test('test far position', () => {
  const char = new AvailablePosition()
  expect(char.getMovePosition(40, 'bowman')).toEqual(
    expect.not.arrayContaining([43])
  )
})

test.each([
  ['swordsman', 8],
  ['bowman', 19],
  ['magician', 41],
  ['daemon', 41],
  ['undead', 8],
  ['vampire', 19]

])(
  ('test attack position %s'),
  (name, positions) => {
    const char = new AvailablePosition()
    expect(char.getAttackPosition(46, name).length).toBe(positions)
  }
)

test('test far position', () => {
  const char = new AvailablePosition()
  expect(char.getAttackPosition(21, 'bowman')).toEqual(
    expect.not.arrayContaining([42])
  )
})
test('test diagonally position', () => {
  const char = new AvailablePosition()
  expect(char.getAttackPosition(21, 'bowman')).toEqual(
    expect.arrayContaining([28, 35])
  )
})
