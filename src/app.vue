<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import box from './components/box.vue'
import notification from './components/notification.vue'
import { FruitGame, FruitsEnum } from './composables/use-game'
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
    gameState.value = game.value.checkGameStatus()
  } catch (error: any) {
    showNotification(error.message)
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
    <div class="centered-container">
      <h1>Игра с коробками</h1>
      <p style="max-width: 800px; max-height: 25%; font-size: 18px;">
        Есть три коробки: в одной лежат только яблоки, в другой — только апельсины, а в третьей — и яблоки, и апельсины.
        Однако все коробки подписаны неправильно. Вам можно достать только один фрукт из любой коробки и по нему определить, что находится в остальных коробках.
        <br><br>
        <b style="color: #992211;">
          У вас есть всего одна попытка! Прежде чем открывать первую коробку, попробуйте определить содержимое остальных коробок.
        </b>
      </p>
      <div v-if="game" class="box-container">
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
      <div v-if="game && game.firstOpenedIndex !== null && game.boxes.filter(b => !b.isOpen).length > 0" class="button-container">
        <button @click="handleCheck">
          Проверить
        </button>
      </div>
      <div v-if="gameState !== 'playing'" class="button-container">
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

.centered-container {
    width: 80%;
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 90vh;
    text-align: center;
    user-select: none;
}

.box-container {
    display: flex;
    justify-content: center;
    margin-top: 50px;
}

.button-container {
    margin-top: 30px;
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
