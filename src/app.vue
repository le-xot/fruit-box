<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import box from './components/box.vue'
import notification from './components/notification.vue'
import { FruitGame, FruitsEnum, YouLostError } from './composables/use-game'
import { useNotification } from './composables/use-notification'

const STORAGE_KEY = 'fruitGameState'
const game = ref<FruitGame | null>(null)
const gameState = ref<'playing' | 'won' | 'lost'>('playing')
const { showNotification } = useNotification()
function loadGame() {
  const savedState = localStorage.getItem(STORAGE_KEY)
  if (savedState) {
    try {
      const json = JSON.parse(savedState)
      game.value = FruitGame.fromJSON(json.game)
      gameState.value = json.gameState
    } catch {
      game.value = new FruitGame()
      gameState.value = 'playing'
    }
  } else {
    game.value = new FruitGame()
    gameState.value = 'playing'
  }
}
onMounted(loadGame)
watch([game, gameState], () => {
  if (game.value) {
    const stateToSave = { game: game.value, gameState: gameState.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  }
}, { deep: true })
function handleBoxClick(index: number) {
  if (!game.value || gameState.value !== 'playing') return
  try {
    game.value.openBox(index)
  } catch (error: any) {
    showNotification(error.message)
  }
}
function handlePredictionChange(index: number, value: FruitsEnum) {
  if (!game.value || gameState.value !== 'playing') return
  try {
    game.value.setPrediction(index, value)
  } catch (error: any) {
    showNotification(error.message)
  }
}
function handleCheck() {
  if (!game.value) return
  try {
    game.value.openRemainingBoxes()
    gameState.value = game.value.checkWin() ? 'won' : 'lost'
  } catch (error: any) {
    if (error instanceof YouLostError) {
      gameState.value = 'lost'
    } else {
      showNotification(error.message)
    }
  }
}
function handleRestart() {
  localStorage.removeItem(STORAGE_KEY)
  game.value = new FruitGame()
  gameState.value = 'playing'
}
const canChangePrediction = ref(true)
</script>

<template>
  <div v-if="gameState === 'lost'" class="loss-screen fullscreen">
    <h1>Ты проиграл</h1>
  </div>
  <div v-else-if="gameState === 'won'" class="win-screen fullscreen">
    <h1>Ты выиграл</h1>
  </div>
  <div v-else>
    <div style="text-align: center; user-select: none;">
      <h1>Игра с коробками</h1>
      <p style="max-width: 800px; margin: auto; font-size: 18px;">
        Есть три коробки с неправильными подписями. Сначала выбери одну коробку – из неё будет вынут фрукт.
        Затем укажи, что находится в двух оставшихся коробках.
      </p>
      <div v-if="game" style="display: flex; justify-content: center; margin-top: 50px;">
        <box
          v-for="(b, index) in game.boxes"
          :key="index"
          :label="b.label"
          :is-open="b.isOpen"
          :content="b.content"
          :took="b.took"
          :prediction="b.prediction"
          :show-prediction="game.firstOpenedIndex !== null && index !== game.firstOpenedIndex"
          :can-change-prediction="canChangePrediction"
          @click="handleBoxClick(index)"
          @prediction-change="handlePredictionChange(index, $event)"
        />
      </div>
      <div v-if="game && game.firstOpenedIndex !== null && game.boxes.filter(b => !b.isOpen).length > 0" style="margin-top: 30px;">
        <button @click="handleCheck">
          Проверить
        </button>
      </div>
      <div v-if="gameState !== 'playing'" style="margin-top: 30px;">
        <button @click="handleRestart">
          Начать заново
        </button>
      </div>
    </div>
    <notification />
  </div>
</template>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fullscreen {
  user-select: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  z-index: 1000;
  animation: fadeIn 1s ease-in;
}
.loss-screen {
  background-color: #000;
  color: #fff;
}
.win-screen {
  background-color: #5af462;
  color: #fff;
}
</style>
