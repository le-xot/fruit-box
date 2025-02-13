<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue'
import { ChestEnum } from '../composables/use-game'

interface Props {
  label: ChestEnum
  isOpen: boolean
  content: ChestEnum | null
  prediction: ChestEnum | null
  took: string | null
  showPrediction: boolean
  canChangePrediction: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'click'): void
  (event: 'prediction-change', value: ChestEnum): void
}>()

const { label, isOpen, content, prediction, took, showPrediction, canChangePrediction } = toRefs(props)
const localPrediction = ref(prediction.value || '')
watch(prediction, (newVal) => {
  localPrediction.value = newVal || ''
})
const fruitOptions = computed(() => [
  { value: ChestEnum.GOLD, label: ChestEnum.GOLD },
  { value: ChestEnum.SILVER, label: ChestEnum.SILVER },
  { value: ChestEnum.MIXED, label: ChestEnum.MIXED },
])
function handleClick() {
  emit('click')
}
function onPredictionChangeInternal(e: Event) {
  const target = e.target as HTMLSelectElement
  const value = target.value as ChestEnum
  emit('prediction-change', value)
}
</script>

<template>
  <div class="box-container">
    <div v-if="!isOpen" class="box" @click="handleClick">
      <div class="text" style="min-height: 70px;">
        {{ label }}
      </div>
      <img style="width: 200px; height: 200px;" src="../assets/chest-closed.webp" alt="chest">
      <div v-if="showPrediction">
        <select v-model="localPrediction" style="padding: 10px; font-size: 15px;" :disabled="!canChangePrediction" @click.stop @change="onPredictionChangeInternal">
          <option value="">
            Выберите содержимое
          </option>
          <option v-for="option in fruitOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    <div v-else class="box">
      <div class="text" style="min-height: 70px;">
        {{ label }}
      </div>
      <img style="width: 200px; height: 200px;" src="../assets/chest-opened.webp" alt="chest">
      <div v-if="took">
        <div class="text">
          Вы достали: <b>{{ took }}</b>
        </div>
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
.text {
  margin-top: 20px;
  font-size: 20px;
}

.box-container {

  margin: 10px;
  padding: 10px;
  text-align: center;
  width: 250px;
}
.box {
  padding: 20px;
  cursor: pointer;
}
</style>
