<template>
  <div id="app">
    <h1>GIM-карты: Список моделей</h1>
    
    <!-- Компонент выбора модели -->
    <ModelList
      @selected-model="onModelSelected"
      @model-forecasts="onModelForecasts"
    />
    
    <!-- Календарь прогнозов -->
    <ForecastCalendar 
      :forecasts="forecasts" 
      @forecast-selected="onForecastSelected"
    />
    
    <!-- Информация о выбранном прогнозе -->
    <div v-if="selectedForecast" class="forecast-info">
      <h3>Выбранный прогноз</h3>
      <div class="forecast-details">
        <p><strong>ID прогноза:</strong> {{ selectedForecast.id || selectedForecast.forecast_id || 'N/A' }}</p>
        <p><strong>Начало прогноза:</strong> {{ formatDate(selectedForecast.forecast_start_date) }}</p>
        <p><strong>Окончание прогноза:</strong> {{ formatDate(selectedForecast.forecast_end_date) }}</p>
        <p><strong>Модель:</strong> {{ selectedModel }}</p>
      </div>
    </div>

    <!-- Компонент отображения GIM-карт -->
    <ImageViewer
      :forecast-id="selectedForecastId"
      :forecast-size="forecastSize"
      @image-loaded="onImageLoaded"
      @image-error="onImageError"
      @update:forecast-size="onForecastSizeUpdate"
    />
  </div>
</template>

<script>
import ModelList from './components/ModelList.vue'
import ForecastCalendar from './components/ForecastCalendar.vue'
import ImageViewer from './components/ImageViewer.vue'

export default {
  name: 'App',
  components: {
    ModelList,
    ForecastCalendar,
    ImageViewer
  }, 

  data() {
    return {
      selectedModel: '',
      forecasts: [],
      selectedForecast: null,
      forecastSize: 0
    }
  },

  computed: {
    selectedForecastId() {
      return this.selectedForecast?.id || this.selectedForecast?.forecast_id || null;
    }
  },

  methods: {
    onModelSelected(model) {
      this.selectedModel = model;
      console.log('Выбрана модель:', model);
    },

    onModelForecasts(modelForecasts) {
      this.forecasts = modelForecasts;
      this.selectedForecast = null; // Сбрасываем выбранный прогноз при смене модели
      console.log('Получены прогнозы модели:', this.forecasts);
    },
    
    onForecastSelected(forecast) {
      this.selectedForecast = forecast;
      console.log('Выбран прогноз:', forecast);
      console.log('Структура прогноза:', Object.keys(forecast));
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    onImageLoaded(imageData) {
      console.log('GIM-карта загружена:', imageData);
    },

    onImageError(error) {
      console.error('Ошибка загрузки GIM-карты:', error);
    },

    onForecastSizeUpdate(newSize) {
      this.forecastSize = newSize;
      console.log('Размер прогноза обновлен:', this.forecastSize);
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 2rem auto;
  max-width: 800px;
  padding: 0 20px;
}

.forecast-info {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
}

.forecast-details p {
  margin: 0.5rem 0;
}

.forecast-actions {
  margin-top: 1rem;
}

.forecast-actions button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.forecast-actions button:hover:not(:disabled) {
  background: #0056b3;
}

.forecast-actions button:disabled {
  background: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

/* Адаптивность */
@media (max-width: 768px) {
  #app {
    margin: 1rem auto;
    padding: 0 10px;
  }
  
  .forecast-info {
    margin-top: 1rem;
    padding: 0.75rem;
  }
}
</style>