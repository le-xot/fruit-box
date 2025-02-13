import { defineStore } from 'pinia'
import { FruitGame, FruitsEnum } from '../composables/use-game'

export const useFruitGameStore = defineStore('fruitGame', {
  state: () => ({
    game: new FruitGame(),
    gameState: 'playing' as 'playing' | 'won' | 'lost',
  }),
  getters: {
    boxes: (state) => state.game.boxes,
    firstOpenedIndex: (state) => state.game.firstOpenedIndex,
  },
  actions: {
    openBox(index: number) {
      if (this.gameState !== 'playing') return
      try {
        const allOpened = this.game.openBox(index)
        if (allOpened) {
          this.gameState = this.game.checkWin() ? 'won' : 'lost'
        }
      } catch (error: any) {
        alert(error.message)
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
      this.game = new FruitGame()
      this.gameState = 'playing'
    },
    saveState() {
      const stateToSave = { game: this.game, gameState: this.gameState }
      localStorage.setItem('fruitGameState', JSON.stringify(stateToSave))
    },
    loadState() {
      const savedState = localStorage.getItem('fruitGameState')
      if (savedState) {
        try {
          const json = JSON.parse(savedState)
          this.game = FruitGame.fromJSON(json.game)
          this.gameState = json.gameState
        } catch {
          this.game = new FruitGame()
          this.gameState = 'playing'
        }
      }
    },
  },
})
