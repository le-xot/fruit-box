<script lang="ts" setup>
import { ref, watch } from 'vue'
import { FruitsEnum } from './game'

interface Props {
  label: FruitsEnum
  isOpen: boolean
  content: FruitsEnum | null
  prediction: FruitsEnum | null
  took: string | null
  showPrediction: boolean
  canChangePrediction: boolean
}
const props = defineProps<Props>()
const emits = defineEmits<{
  (e: 'click'): void
  (e: 'prediction-change', value: FruitsEnum): void
}>()

const localPrediction = ref(props.prediction || '')

watch(() => props.prediction, (newVal) => {
  localPrediction.value = newVal || ''
})

function handleClick() {
  emits('click')
}

function onPredictionChangeInternal(event: Event) {
  const value = (event.target as HTMLSelectElement).value as FruitsEnum
  emits('prediction-change', value)
}
</script>

<template>
  <div class="box-container">
    <!-- Если коробка ещё не открыта -->
    <div v-if="!isOpen" class="box" @click="handleClick">
      <p>{{ label }}</p>
      <!-- Если нужно задать предсказание -->
      <div v-if="showPrediction">
        <select
          v-model="localPrediction" :disabled="!canChangePrediction" @click.stop
          @change="onPredictionChangeInternal"
        >
          <option value="">
            Выберите содержимое
          </option>
          <option :value="FruitsEnum.Apple">
            {{ FruitsEnum.Apple }}
          </option>
          <option :value="FruitsEnum.Orange">
            {{ FruitsEnum.Orange }}
          </option>
          <option :value="FruitsEnum.AppleAndOrange">
            {{ FruitsEnum.AppleAndOrange }}
          </option>
        </select>
      </div>
      <!-- Если предсказание не показывается, кнопка открытия -->
      <button v-else>
        Открыть
      </button>
    </div>
    <!-- Если коробка открыта -->
    <div v-else class="box opened">
      <div v-if="took">
        <p>Вы достали: <b>{{ took }}</b></p>
      </div>
      <div v-else>
        <p>Содержимое: <b>{{ content }}</b></p>
      </div>
      <div v-if="showPrediction && prediction">
        <p>Ваш выбор: <b>{{ prediction }}</b></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.box-container {
    margin: 10px;
    border: 1px solid #ccc;
    padding: 10px;
    text-align: center;
    width: 250px;
}

.box {
    padding: 20px;
    cursor: pointer;
}

.box.opened {
    background-color: #f0f0f0;
}
</style>
