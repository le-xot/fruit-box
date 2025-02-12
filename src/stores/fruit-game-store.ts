import { defineStore } from 'pinia'
import { FruitGame, FruitsEnum, YouLostError } from '../composables/use-game'

export const useFruitGameStore = defineStore('fruitGame', {
  state: () => ({
    game: new FruitGame(),
    gameState: 'playing' as 'playing' | 'won' | 'lost',
  }),
  getters: {
    boxes: (state) => state.game._boxes, // можно добавить обёртку, если понадобится
    indexOpenedBox: (state) => state.game.indexOpenedBox,
  },
  actions: {
    openBox(index: number) {
      if (this.gameState !== 'playing') return
      try {
        const allOpened = this.game.open(index)
        if (allOpened) {
          this.gameState = this.game.checkWin() ? 'won' : 'lost'
        }
      } catch (error: any) {
        if (error instanceof YouLostError) {
          this.gameState = 'lost'
        } else {
          // Здесь можно заменить alert на уведомление через UI-компонент
          alert(error.message)
        }
      }
    },
    setPrediction(index: number, prediction: FruitsEnum) {
      if (this.gameState !== 'playing') return

      try {
        this.game.setPrediction(index, prediction)
      } catch (error: any) {
        alert(error.message)
      }
    },
    restartGame() {
      // Можно также вынести сохранение/загрузку состояния в отдельные функции
      this.game = new FruitGame()
      this.gameState = 'playing'
    },
    saveState() {
      const stateToSave = {
        game: this.game.toJSON(),
        gameState: this.gameState,
      }
      localStorage.setItem('fruitGameState', JSON.stringify(stateToSave))
    },
    loadState() {
      const savedState = localStorage.getItem('fruitGameState')
      if (savedState) {
        try {
          const json = JSON.parse(savedState)
          this.game = FruitGame.fromJSON(json.game)
          this.gameState = json.gameState
        } catch (error) {
          console.error('Ошибка при загрузке сохранённого состояния:', error)
          this.game = new FruitGame()
          this.gameState = 'playing'
        }
      }
    },
  },
})
