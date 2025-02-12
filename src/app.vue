<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import Box from './components/box.vue'

import Notification from './components/notification.vue'
import { FruitGame, FruitsEnum, YouLostError } from './composables/use-game'
import { useNotification } from './composables/use-notification.ts'

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
    } catch (error) {
      console.error('Ошибка при загрузке сохранённого состояния:', error)
      game.value = new FruitGame()
      gameState.value = 'playing'
    }
  } else {
    game.value = new FruitGame()
    gameState.value = 'playing'
  }
}

onMounted(loadGame)

watch(
  [game, gameState],
  () => {
    if (game.value) {
      const stateToSave = {
        game: game.value.toJSON(),
        gameState: gameState.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    }
  },
  { deep: true },
)

function handleBoxClick(index: number) {
  if (!game.value || gameState.value !== 'playing') return
  try {
    const allOpened = game.value.open(index)
    game.value = game.value.clone()
    if (allOpened) {
      gameState.value = game.value.checkWin() ? 'won' : 'lost'
    }
  } catch (error: any) {
    if (error instanceof YouLostError) {
      gameState.value = 'lost'
    } else {
      showNotification(error.message)
    }
  }
}

function handlePredictionChange(index: number, value: FruitsEnum) {
  if (!game.value || gameState.value !== 'playing') return
  try {
    game.value.setPrediction(index, value)
    game.value = game.value.clone()
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
    <h1>ты выиграл</h1>
  </div>

  <div v-else>
    <div style="text-align: center; user-select: none;">
      <h1>Игра с коробками</h1>
      <p style="max-width: 800px; margin: auto; font-size: 18px;">
        Есть три коробки: в одной лежат только яблоки, в другой — только апельсины, а в третьей — и яблоки, и апельсины.
        Однако все коробки подписаны неправильно. Вам можно достать только один фрукт из любой коробки и по нему определить, что находится в остальных коробках.
        <br><br>
        <b style="color: #992211;">
          У вас есть всего одна попытка! Прежде чем открывать первую коробку, попробуйте определить содержимое остальных коробок.
        </b>
      </p>

      <div v-if="game" style="display: flex; justify-content: center; margin-top: 50px;">
        <Box
          v-for="(box, index) in game._boxes"
          :key="index"
          :label="box.label"
          :is-open="box.isOpen"
          :content="box.content"
          :prediction="box.prediction"
          :took="box.took"
          :show-prediction="game.indexOpenedBox !== null && index !== game.indexOpenedBox"
          :can-change-prediction="canChangePrediction"
          @click="handleBoxClick(index)"
          @prediction-change="handlePredictionChange(index, $event)"
        />
      </div>

      <div v-if="gameState !== 'playing'" style="margin-top: 30px;">
        <button @click="handleRestart">
          Начать заново
        </button>
      </div>
    </div>
    <Notification />
  </div>
</template>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
