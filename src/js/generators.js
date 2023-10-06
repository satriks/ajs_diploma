import Team from './Team'
/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function * characterGenerator (allowedTypes, maxLevel) {
  while (true) {
    yield new allowedTypes[Math.floor(Math.random() * allowedTypes.length)](Math.floor((Math.random() * maxLevel) + 1))
  }
  // TODO: write logic here
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam (allowedTypes, maxLevel, characterCount) {
  const heroesList = []
  const heroGenerator = characterGenerator(allowedTypes, maxLevel)
  for (let i = 0; i < characterCount; i += 1) {
    heroesList.push(heroGenerator.next().value)
  }
  return new Team(heroesList)
  // TODO: write logic here
}
