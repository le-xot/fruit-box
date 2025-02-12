<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import BoxComponent from './box-component.vue'
import { FruitGame, FruitsEnum, YouLostError } from './game'

const STORAGE_KEY = 'fruitGameState'

const game = ref<FruitGame | null>(null)
const gameState = ref<'playing' | 'won' | 'lost'>('playing')

onMounted(() => {
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
})

watch([game, gameState], () => {
  if (game.value) {
    const stateToSave = {
      game: game.value.toJSON(),
      gameState: gameState.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  }
}, { deep: true })

function handleBoxClick(index: number) {
  if (!game.value || gameState.value !== 'playing') return
  try {
    game.value.open(index)
    // Клонируем состояние игры после изменения
    game.value = game.value.clone()

    if (game.value._boxes.every(box => box.isOpen)) {
      const isWin = game.value.checkWin()
      gameState.value = isWin ? 'won' : 'lost'
    }
  } catch (error: any) {
    if (error instanceof YouLostError) {
      gameState.value = 'lost'
    } else {
      alert(error.message)
    }
  }
}

function handlePredictionChange(index: number, value: FruitsEnum) {
  if (!game.value || gameState.value !== 'playing') return
  const numBoxesOpened = game.value._boxes.filter(box => box.isOpen).length
  if (numBoxesOpened < 2) {
    try {
      game.value.setPrediction(index, value)
      game.value = game.value.clone()
    } catch (error: any) {
      alert(error.message)
    }
  } else {
    alert('Вы больше не можете менять свой выбор')
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
  <div style="text-align: center; user-select: none;">
    <h1>Игра с коробками</h1>
    <p style="max-width: 800px; margin: auto; font-size: 18px;">
      Есть три коробки: в одной лежат только яблоки, в другой — только апельсины, а в третьей — и яблоки, и апельсины.
      Однако все коробки подписаны неправильно: на коробке с яблоками не может быть написано "яблоки",
      на коробке с апельсинами — "апельсины", и на коробке с обоими фруктами — "яблоки и апельсины".
      Вам можно достать только один фрукт из любой коробки и по нему определить, что находится в остальных коробках.
      <br><br>
      Опишите алгоритм, как гарантированно определить содержимое каждой коробки.
      <br><br>
      <b style="color: #992211;">
        У вас есть всего одна попытка! Прежде чем открывать первую коробку, попробуйте определить содержимое остальных
        коробок, так как начать заново нельзя!
      </b>
    </p>

    <div v-if="game" style="display: flex; justify-content: center; margin-top: 50px;">
      <BoxComponent
        v-for="(box, index) in game._boxes" :key="index" :label="box.label" :is-open="box.isOpen"
        :content="box.content" :prediction="box.prediction" :took="box.took"
        :show-prediction="game.indexOpenedBox !== null && index !== game.indexOpenedBox"
        :can-change-prediction="canChangePrediction" @click="handleBoxClick(index)"
        @prediction-change="handlePredictionChange(index, $event)"
      />
    </div>

    <div style="margin-top: 50px; font-size: 24px;">
      <div v-if="gameState === 'won'" style="color: #119922;">
        Поздравляем! Вы победили!
      </div>
      <div v-if="gameState === 'lost'" style="color: #992211;">
        К сожалению, вы проиграли.
      </div>
    </div>

    <div v-if="gameState !== 'playing'" style="margin-top: 30px;">
      <button @click="handleRestart">
        Начать заново
      </button>
    </div>
  </div>
</template>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
