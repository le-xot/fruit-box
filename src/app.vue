<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import box from './components/box.vue'
import notification from './components/notification.vue'
import { ChestEnum, FruitGame } from './composables/use-game'
import { useNotification } from './composables/use-notification'

const STORAGE_KEY = 'coinGameState'
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
function handlePredictionChange(index: number, value: ChestEnum) {
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
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div class="text">
        {{ "Ты проиграл" }}
      </div>
      <button class="button" style="margin-top: 50px;" @click="handleRestart">
        Начать заново
      </button>
    </div>
  </div>
  <div v-else-if="gameState === 'won'" class="win-screen fullscreen">
    <div class="text">
      {{ "Ты победил" }}
    </div>
  </div>
  <div v-else>
    <div class="centered-container">
      <h1>Загадка с сундуками</h1>
      <p style="max-width: 800px; max-height: 25%; font-size: 18px;">
        Есть три сундука: в одном лежат только золотые монеты, в другом — только серебрянные, а в третьем — и золотые, и серебрянные.
        Однако все сундуки подписаны неправильно. Вам можно достать только одну монету из любого сундука и по ней определить, что находится в остальных сундуках.
        <br><br>
        <b style="color: #992211;">
          У вас есть всего одна попытка! Прежде чем открывать первый сундук, попробуйте определить содержимое остальных сундуках.
        </b>
      </p>
      <div v-if="game" class="box-container mobile">
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

@media screen and (max-width: 700px) {
  .mobile {
    flex-direction: column;
    gap: 20px;
  }
}

.text {
  font-size: 10vw;
  text-shadow: 0px 1px 16px rgba(0, 0, 0, 0.4);
}

.button{
  display: flex;
  width: 200px;
  justify-content: center;
  border: none;
  color: #fff;
  background-color: #9BC53D;
  border-radius: 8px;
  cursor: pointer;
}

.centered-container {
    width: 80%;
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    user-select: none;
}

.box-container {
    display: flex;
    justify-content: center;
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
  background-color: #404E4D;
  color: #fff;
}
.win-screen {
  background-color: #9BC53D;
  color: #fff;
}
</style>
