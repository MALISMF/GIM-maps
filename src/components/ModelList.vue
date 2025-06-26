<template>
  <div>
    <h2>Список моделей</h2>
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" style="color: red">Ошибка: {{ error }}</div>
    <div v-else>
      <select v-model="selectedModel" style="min-width: 250px;" :disabled="loadingForecasts">
        <option value="" disabled>Выберите модель...</option>
        <option v-for="model in models" :key="model" :value="model">{{ model }}</option>
      </select>
      
      <div v-if="selectedModel" style="margin-top: 1rem;">
        <strong>Выбрана модель:</strong> {{ selectedModel }}
        <div v-if="loadingForecasts" style="margin-top: 0.5rem; color: #666;">
          Загрузка прогнозов...
        </div>
        <div v-else-if="forecasts.length > 0" style="margin-top: 0.5rem; color: #28a745;">
          Найдено прогнозов: {{ forecasts.length }}
        </div>
        <div v-else-if="!loadingForecasts" style="margin-top: 0.5rem; color: #666;">
          Прогнозы не найдены для выбранной модели.
        </div>
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
      loadingForecasts: false,
      error: null,
      selectedModel: '',
      forecasts: []
    }
  },
  
  methods: {
    // Загрузка списка моделей
    async loadModels() {
      try {
        const res = await axios.get('https://services.simurg.space/gim-tec-forecast/models');
        this.models = Array.isArray(res.data) ? res.data : (res.data.models || []);
        
        // Автоматически выбираем первую модель
        if (this.models.length > 0) {
          this.selectedModel = this.models[0];
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    
    // Загрузка прогнозов для выбранной модели
    async refresh_forecasts(modelCode) {
      if (!modelCode) return;
      
      this.loadingForecasts = true;
      this.forecasts = [];
      
      try {
        console.log(`Загружаем прогнозы для модели: ${modelCode}`);
        
        const res = await axios.get(`https://services.simurg.space/gim-tec-forecast/get_forecasts/${modelCode}`);
        
        // Доступные прогнозы модели
        this.forecasts = Array.isArray(res.data) ? res.data : [];
        
        console.log(`Получено прогнозов: ${this.forecasts.length}`, this.forecasts);
        
        // Эмитим события только после успешной загрузки
        this.$emit('selected-model', modelCode);
        this.$emit('model-forecasts', this.forecasts);
        
      } catch (err) {
        console.error('Ошибка загрузки прогнозов:', err);
        this.error = `Ошибка загрузки прогнозов: ${err.message}`;
        this.forecasts = [];
        
        // Все равно эмитим события, чтобы компонент знал о состоянии
        this.$emit('selected-model', modelCode);
        this.$emit('model-forecasts', []);
      } finally {
        this.loadingForecasts = false;
      }
    }
  },
  
  async mounted() {
    await this.loadModels();
  },

  watch: {
    selectedModel: {
      handler(newModel) {
        if (newModel) {
          // Запускаем загрузку прогнозов
          this.refresh_forecasts(newModel);
        }
      },
      immediate: true
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

select:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}
</style>