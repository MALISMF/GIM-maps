<template>
  <div class="model-list-container">
    <h2>Доступные модели</h2>
    <div class="select-wrapper">
      <select v-model="selectedModel">
        <option value="" disabled>Выберите модель</option>
        <option v-for="model in models" :key="model" :value="model">{{ model }}</option>
      </select>
    </div>
    <div v-if="selectedModel" class="forecast-count">
      {{ forecastCountText }}
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
      selectedModel: '',
      forecasts: []
    }
  },
  
  methods: {
    async loadModels() {
      const res = await axios.get('https://services.simurg.space/gim-tec-forecast/models');
      this.models = Array.isArray(res.data) ? res.data : (res.data.models || []);
      if (this.models.length > 0) {
        this.selectedModel = this.models[0];
      }
    },
    async refresh_forecasts(modelCode) {
      if (!modelCode) return;
      this.forecasts = [];
      try {
        const res = await axios.get(`https://services.simurg.space/gim-tec-forecast/get_forecasts/${modelCode}`);
        this.forecasts = Array.isArray(res.data) ? res.data : [];
        this.$emit('selected-model', modelCode);
        this.$emit('model-forecasts', this.forecasts);
      } catch (err) {
        this.$emit('selected-model', modelCode);
        this.$emit('model-forecasts', []);
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
          this.refresh_forecasts(newModel);
        }
      },
      immediate: true
    }
  },

  computed: {
    forecastCountText() {
      if (this.forecasts.length > 0) {
        return `Найдено прогнозов: ${this.forecasts.length}`;
      }
      return 'Прогнозы для модели не найдены.';
    }
  }
}
</script>

<style scoped>
.model-list-container {
  width: 100%;
}
.select-wrapper {
  position: relative;
}
select {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
}
.forecast-count {
  margin-top: 10px;
  font-size: 0.85rem;
  color: #78818b;
}
</style>