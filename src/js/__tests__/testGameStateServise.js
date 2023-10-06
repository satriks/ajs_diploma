import GameStateService from '../GameStateService'
import GamePlay from '../GamePlay'
import GameController from '../GameController'

test('test GameStateServise ', () => {
  const GameServise = new GameStateService()
  jest.spyOn(GameServise, 'load').mockImplementation(() => ({ state: 'game' }))
  expect(GameServise.load()).toEqual({ state: 'game' })
})
test('test GameStateServise Error ', () => {
  const GameServise = new GameStateService()
  expect(() => GameServise.load()).toThrow(Error)
})
test('test Error from GameCOntroller', () => {
  const game = new GameController(new GamePlay(), new GameStateService())
  expect(() => game.onLoadGame()).toThrow(Error)
})
