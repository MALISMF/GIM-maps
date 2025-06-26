<template>
  <div>
    <h2>Список моделей</h2>
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" style="color: red">Ошибка: {{ error }}</div>
    <div v-else>
      <select v-model="selectedModel" style="min-width: 250px;" >
        <option value="" disabled>Выберите модель...</option>
        <option v-for="model in models" :key="model" :value="model">{{ model }}</option>
      </select>
      <div v-if="selectedModel" style="margin-top: 1rem;">
        <strong>Выбрана модель:</strong> {{ selectedModel }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ModelList',
  emits: ['selected-model', 'model-forecasts'],

  data() {
    return {
      models: [],
      loading: true,
      error: null,
      selectedModel: '',
      forecasts: []
    }
  },
  methods: {
    // Загрузка списка моделей
  loadModels() {
    axios.get('https://services.simurg.space/gim-tec-forecast/models')
      .then(res => {
        this.models = Array.isArray(res.data) ? res.data : (res.data.models || [])
        this.selectedModel = this.models[0]
      })
      .catch(err => {
        this.error = err.message
      })
      .finally(() => {
        this.loading = false
      })
    },
    refresh_forecasts(modelCode) {
      // а) Загрузка прогнозов
        axios.get(`https://services.simurg.space/gim-tec-forecast/get_forecasts/${modelCode}`)
          .then(res => {
            // Доступные прогнозы модели
            this.forecasts = res.data
          })
        
    }
  },
  mounted() {
    this.loadModels()
  },

  watch: {
    selectedModel(newModel) {
      if (newModel) {
        this.refresh_forecasts(newModel)
        // Эмитим событие для родительского компонента
        this.$emit('selected-model', newModel)
        this.$emit('model-forecasts', this.forecasts)
      }
    }
  }
}

</script>

<style scoped>
select {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
</style> 