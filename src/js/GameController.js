import GamePlay from './GamePlay'
import { getTooltip } from './utils'
import cursor from './cursors'
import AvailablePosition from './AvailablePosition'
import AI from './AiModule'
import GameState from './GameState'
import Team from './Team'

export default class GameController {
  constructor (gamePlay, stateService) {
    this.gamePlay = gamePlay
    this.stateService = stateService
    this.gameState = new GameState()

    this.goodTeam = null
    this.evilTeam = null

    this.charSelected = null
    this.positionToMove = null
    this.positionToAttack = null

    this.availablePosition = new AvailablePosition()
    this.ai = new AI()
  }

  init () {
    this.gamePlay.drawUi(this.gameState.getLevel())
    if (!this.goodTeam) {
      this.getStartPosition()
    }
    this.gamePlay.redrawPositions([...this.goodTeam.characters, ...this.evilTeam.characters])

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this))
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this))
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this))
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this))
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this))
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this))
  }

  onCellClick (index) {
    this.checkGame()
    if (this.gamePlay.gameStatus !== 'stop') {
      if (this.gamePlay.cells[index].childNodes.length) {
        const char = this.currentCharactersPosition.filter((el) => el.position === index)[0]
        // Добрый персонаж
        if (['swordsman', 'magician', 'bowman'].includes(char.character.type)) {
          if (this.charSelected) {
            this.gamePlay.deselectCell(this.charSelected.position)
            this.positionToAttack = null
            this.positionToMove = null
          }

          this.gamePlay.selectCell(index)
          this.charSelected = char
          const blockPosition = this.currentCharactersPosition.map((el) => el.position)
          // eslint-disable-next-line
          this.positionToMove = this.availablePosition.getMovePosition(this.charSelected.position, this.charSelected.character.type).filter((el) => !blockPosition.includes(el));
          this.positionToAttack = this.availablePosition.getAttackPosition(this.charSelected.position, this.charSelected.character.type)
        }
        // Злой персонаж
        if (['undead', 'vampire', 'daemon'].includes(char.character.type)) {
          if (this.charSelected && this.positionToAttack.includes(index)) {
            const target = this.currentCharactersPosition.filter((el) => el.position === index)
            // eslint-disable-next-line
            const damage = Math.max(this.charSelected.character.attack - target[0].character.defence, this.charSelected.character.attack * 0.1);
            this.gamePlay.showDamage(index, damage)
              .then(() => {
                target[0].character.health -= damage

                if (target[0].character.health <= 0) {
                  this.characterDeath(target[0])
                }
                this.gamePlay.deselectCell(index)
              })
              .then(() => {
                this.gamePlay.redrawPositions(this.currentCharactersPosition)
                this.enemyTurn()
              })
          } else { GamePlay.showError('Это не персонаж игрока') }
        }
        // Нет персонажа
      } else if (this.charSelected && this.positionToMove.includes(index)) {
        this.gamePlay.deselectCell(this.charSelected.position)
        this.gamePlay.deselectCell(index)
        this.charSelected.position = index

        this.gamePlay.redrawPositions(this.currentCharactersPosition)
        this.charSelected = null
        this.enemyTurn()
      }
    }
  }

  onCellEnter (index) {
    this.checkGame()
    this.currentCharactersPosition = [...this.goodTeam.characters, ...this.evilTeam.characters]
    if (this.gamePlay.gameStatus !== 'stop') {
      if (this.gamePlay.cells[index].childNodes.length) {
        const message = getTooltip(this.currentCharactersPosition.filter((el) => el.position === index)[0].character)

        const char = this.currentCharactersPosition.filter((el) => el.position === index)
        // Добрый персонаж
        if (['swordsman', 'magician', 'bowman'].includes(char[0].character.type)) {
          this.gamePlay.setCursor(cursor.pointer)
        }
        this.gamePlay.showCellTooltip(message, index)
      }

      if (this.charSelected) {
        if (this.gamePlay.cells[index].childNodes.length) {
          const charEnemyClass = this.currentCharactersPosition.filter((el) => el.position === index)[0].character.type
          // Враг
          if (['undead', 'vampire', 'daemon'].includes(charEnemyClass)) {
            if (this.positionToAttack.includes(index)) {
              this.gamePlay.setCursor(cursor.crosshair)
              this.gamePlay.selectCell(index, 'red')
            } else {
              this.gamePlay.setCursor(cursor.notallowed)
            }
          }
        }
        // Варианты хода
        if (this.positionToMove.includes(index)) {
          this.gamePlay.selectCell(index, 'green')
          this.gamePlay.setCursor(cursor.pointer)
        }
      }
    }
  }

  onCellLeave (index) {
    this.checkGame()

    if (this.gamePlay.gameStatus !== 'stop') {
      this.gamePlay.hideCellTooltip(index)
      this.gamePlay.setCursor('auto')
      if (this.charSelected) {
        if (this.charSelected.position !== index) {
          this.gamePlay.deselectCell(index)
        }
      }
    }
  }

  getStartPosition () {
    this.goodTeam = Team.getGoodTeam()
    this.evilTeam = Team.getEvilTeam(this.goodTeam)
    this.currentCharactersPosition = [...this.goodTeam.characters, ...this.evilTeam.characters]
  }

  nextLevel () {
    this.gameState.level += 1
    if (this.gameState.level > 3) {
      // eslint-disable-next-line
      alert('Победа!');
      this.gamePlay.gameStatus = 'stop'
      return
    }
    console.log(this.goodTeam)
    this.goodTeam.levelUp()

    this.gamePlay.drawUi(this.gameState.getLevel())
    this.evilTeam = Team.getEvilTeam(this.goodTeam)
    this.currentCharactersPosition = [...this.goodTeam.characters, ...this.evilTeam.characters]
    this.gamePlay.redrawPositions(this.currentCharactersPosition)
  }

  characterDeath (char) {
    if (this.goodTeam.characters.includes(char)) {
      this.evilTeam.characters.forEach((el) => this.gamePlay.deselectCell(el.position))
    }
    this.goodTeam.characters = this.goodTeam.characters.filter((el) => el.position !== char.position)
    this.evilTeam.characters = this.evilTeam.characters.filter((el) => el.position !== char.position)
    this.currentCharactersPosition = [...this.goodTeam.characters, ...this.evilTeam.characters]
    this.gamePlay.redrawPositions(this.currentCharactersPosition)
  }

  enemyTurn () {
    this.checkGame()
    if (this.evilTeam.characters.length === 0) {
      this.nextLevel()
      return
    }
    if (this.gamePlay.gameStatus !== 'stop') {
      // ход противника
      const turn = this.ai.turn(this.goodTeam, this.evilTeam)
      if (turn.type === 'attack') {
        const [index, damage] = [...turn.data]
        this.gamePlay.showDamage(index, damage)
          .then(() => {
            const target = this.currentCharactersPosition.filter((el) => el.position === index)
            target[0].character.health -= damage
            if (target[0].character.health <= 0) {
              this.characterDeath(target[0])
              this.charSelected = null
            }
            this.gamePlay.deselectCell(index)
          })
          .then(() => { this.gamePlay.redrawPositions(this.currentCharactersPosition) })
      }
      if (turn.type === 'move') {
        const [charm] = this.currentCharactersPosition.filter((el) => el === turn.data[1])
        // eslint-disable-next-line
        charm.position = turn.data[0];
        this.gamePlay.redrawPositions(this.currentCharactersPosition)
        // this.updateTeam();
      }
    }
  }

  checkGame () {
    if (this.gamePlay.gameStatus !== 'stop') {
      if (this.evilTeam.characters.length === 0) {
        this.nextLevel()
      }

      if (this.goodTeam.characters.length === 0) {
        this.gamePlay.gameStatus = 'stop'
      }
    }
  }

  onNewGame () {
    this.gameState = null
    this.gamePlay.cellClickListeners = []
    this.gamePlay.cellEnterListeners = []
    this.gamePlay.cellLeaveListeners = []
    this.gamePlay.newGameListeners = []
    this.gamePlay.gameStatus = 'play'

    this.gameState = new GameState()
    this.availablePosition = new AvailablePosition()
    this.goodTeam = null
    this.evilTeam = null
    // this.currentCharactersPosition = [];
    this.charSelected = null
    this.positionToMove = null
    this.positionToAttack = null
    this.ai = new AI()
    this.init()
  }

  onSaveGame () {
    this.stateService.save({ ...this })
  }

  onLoadGame () {
    try {
      const data = this.stateService.load()

      this.gamePlay.cellClickListeners = []
      this.gamePlay.cellEnterListeners = []
      this.gamePlay.cellLeaveListeners = []
      this.gamePlay.newGameListeners = []

      // this.currentCharactersPosition = data.currentCharactersPosition;

      this.evilTeam = new Team(data.evilTeam.characters)
      this.goodTeam = new Team(data.goodTeam.characters)
      this.charSelected = data.charSelected
      this.positionToMove = data.positionToMove
      this.positionToAttack = data.positionToAttack
      this.gameState.level = data.gameState.level
      this.gamePlay.gameStatus = data.gamePlay.gameStatus

      this.init()
    } catch (err) {
      GamePlay.showError(err)
    }
  }
}
