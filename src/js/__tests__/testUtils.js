import { calcTileType } from '../utils';

test('test calcTileType out of range', () => {
  expect(() => calcTileType(88, 8)).toThrow(Error);
});

test.each([
  ['top-left', 0, 8],
  ['top-right', 7, 8],
  ['top', 1, 8],
  ['bottom', 60, 8],
  ['bottom-left', 56, 8],
  ['bottom-right', 63, 8],
  ['right', 55, 8],
  ['left', 16, 8],
  ['center', 30, 8],
  ['left', 7, 7],

])(
  ('test calcTileType %s'),
  (place, index, size) => {
    expect(calcTileType(index, size)).toBe(place);
  },
);
