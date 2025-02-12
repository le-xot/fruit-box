<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue'
import { FruitsEnum } from '../composables/use-game'

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
const emit = defineEmits<{
  (event: 'click'): void
  (event: 'prediction-change', value: FruitsEnum): void
}>()

const { label, isOpen, content, prediction, took, showPrediction, canChangePrediction } = toRefs(props)

const localPrediction = ref(prediction.value || '')
watch(prediction, (newVal) => {
  localPrediction.value = newVal || ''
})

const fruitOptions = computed(() => [
  { value: FruitsEnum.Apple, label: FruitsEnum.Apple },
  { value: FruitsEnum.Orange, label: FruitsEnum.Orange },
  { value: FruitsEnum.AppleAndOrange, label: FruitsEnum.AppleAndOrange },
])

function handleClick() {
  emit('click')
}

function onPredictionChangeInternal(e: Event) {
  const target = e.target as HTMLSelectElement
  const value = target.value as FruitsEnum
  emit('prediction-change', value)
}
</script>

<template>
  <div class="box-container">
    <div v-if="!isOpen" class="box" @click="handleClick">
      <p>{{ label }}</p>
      <div v-if="showPrediction">
        <select
          v-model="localPrediction"
          :disabled="!canChangePrediction"
          @click.stop
          @change="onPredictionChangeInternal"
        >
          <option value="">
            Выберите содержимое
          </option>
          <option v-for="option in fruitOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <button v-else>
        Открыть
      </button>
    </div>

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
