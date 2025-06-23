<template>
  <div id="app">
    <div class="left-panel">
      <ModelList 
        @selected-model="onModelSelected" 
        @model-forecasts="onModelForecasts"
      />
      <ForecastCalendar 
        :forecasts="forecasts" 
        @forecast-selected="onForecastSelected" 
      />
    </div>

    <div class="right-panel">
      <div v-if="isPanelLoading" class="right-panel-loading-overlay">
        <div class="spinner"></div>
        <p>Загрузка данных прогноза...</p>
      </div>
      
      <div v-if="error" class="error-display">
        <p><strong>Ошибка:</strong> {{ error }}</p>
      </div>
      
      <template v-if="selectedForecast">
        <div class="forecast-header">
          <h2>Просмотр прогноза</h2>
          <div class="forecast-info">
            <p><strong>Дата:</strong> {{ formatDate(selectedForecast.forecast_start_date) }}</p>
            <p><strong>ID:</strong> {{ selectedForecast.id }}</p>
            
            <div v-if="forecastSize > 0" class="image-controls">
              <label for="shift-select"><strong>Карта:</strong></label>
              <select 
                id="shift-select" 
                v-model.number="selectedShift"
                :disabled="isPanelLoading"
              >
                <option 
                  v-for="n in forecastSize" 
                  :key="n - 1" 
                  :value="n - 1"
                >
                  {{ n - 1 }} ({{ getShiftTime(n - 1) }})
                </option>
              </select>
            </div>
            
            <p v-if="forecastSize > 0" class="total-maps-info">
              <strong>Всего:</strong> {{ forecastSize }}
            </p>
          </div>
        </div>
        
        <div class="viewer-area">
          <ImageViewer 
            :key="selectedForecast?.id"
            :forecast-id="selectedForecast?.id"
            :is-panel-loading="isPanelLoading"
            :selected-shift="selectedShift"
            @image-loaded="onImageLoaded"
            @image-error="onImageError"
          />
          <DownloadNPZ :forecast-id="selectedForecast?.id"/>
        </div>
      </template>
      
      <div v-else-if="!isPanelLoading && !error" class="viewer-area no-forecast-selected">
        <p>Выберите модель и дату для просмотра GIM-карт.</p>
      </div>
    </div>
  </div>
</template>

<script>
import ModelList from './components/ModelList.vue'
import ForecastCalendar from './components/ForecastCalendar.vue'
import ImageViewer from './components/ImageViewer.vue';
import DownloadNPZ from './components/DownloadNPZ.vue';

export default {
  name: 'App',
  components: {
    ModelList,
    ForecastCalendar,
    ImageViewer,
    DownloadNPZ
  }, 

  data() {
    return {
      models: [],
      forecasts: [],
      selectedModel: null,
      selectedForecast: null,
      isPanelLoading: false,
      error: null,
      currentShiftInfo: null,
      baseUrl: 'https://services.simurg.space/gim-tec-forecast',
      forecastSize: 24,
      selectedShift: 0
    }
  },

  computed: {
    selectedForecastId() {
      return this.selectedForecast?.id || this.selectedForecast?.forecast_id || null;
    }
  },
  
  watch: {
    selectedForecast: {
      handler(newForecast) {
        if (newForecast) {
          this.isPanelLoading = true;
          this.error = null;
          this.currentShiftInfo = null;
        }
      },
      immediate: true
    }
  },

  methods: {
    onModelSelected(model) {
      this.selectedModel = model;
    },

    onModelForecasts(modelForecasts) {
      this.forecasts = modelForecasts;
      this.selectedForecast = null;
    },
    
    onForecastSelected(forecast) {
      this.selectedForecast = forecast;
    },

    onImageLoaded() {
      this.isPanelLoading = false;
    },

    onImageError(error) {
      this.error = error;
      this.isPanelLoading = false;
    },
    
    onShiftChanged(shiftInfo) {
      this.currentShiftInfo = shiftInfo;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    async fetchForecastSize(forecastId) {
      try {
        const response = await fetch(`${this.baseUrl}/get_forecast_size/${forecastId}`);
        if (!response.ok) throw new Error('Сетевой ответ не был успешным');
        const textResponse = await response.text();
        const data = JSON.parse(textResponse);
        this.forecastSize = data.size || data.forecast_size || data.total_shifts || 24;
      } catch (e) {
        this.forecastSize = 24;
      }
    },
    
    getShiftTime(shift) {
      const hours = shift;
      const minutes = 0;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 2rem auto;
  max-width: 1200px;
  padding: 0 20px;
}

.main-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.left-panel {
  flex: 1;
  min-width: 350px; /* Adjust as needed */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  flex: 2;
  min-width: 650px; /* Минимальная ширина, чтобы избежать сжатия */
  position: relative;
  height: 750px; /* Фиксированная высота */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
  color: #333;
  display: flex; /* Включаем flex-контейнер */
  flex-direction: column; /* Располагаем элементы в колонку */
}

.viewer-area {
  flex-grow: 1; /* Занимает всё доступное пространство */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Центрируем контент */
  align-items: center;
  min-height: 0; /* Важно для правильной работы flex-grow */
  gap: 15px;
}

.forecast-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
}

.forecast-info p {
  margin: 0;
  color: #333;
}

.forecast-info strong {
  margin-right: 8px;
  color: #333;
  font-weight: 600;
}

.forecast-header h2 {
  margin-bottom: 10px;
}

.forecast-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
}

.forecast-info p {
  margin: 0;
  color: #333;
}

.forecast-info strong {
  margin-right: 8px;
  color: #333;
  font-weight: 600;
}

.viewer-area {
  flex-grow: 1; /* Занимает всё доступное пространство */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Центрируем контент */
  align-items: center;
  min-height: 0; /* Важно для правильной работы flex-grow */
  gap: 15px;
}

.forecast-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.forecast-details p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.shift-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 6px;
}

.shift-selector label {
  font-weight: bold;
  color: #555;
}

.shift-selector select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #333;
}

.shift-info {
  font-size: 12px;
  color: #666;
}

.no-forecast {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: #666;
}

.error-message {
  text-align: center;
  color: #dc3545;
  padding: 20px;
}

.retry-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #0056b3;
}

/* Адаптивность */
@media (max-width: 992px) {
  .main-layout {
    flex-direction: column;
  }
  
  .left-panel {
    width: 100%;
    min-width: unset;
  }
}

@media (max-width: 768px) {
  #app {
    margin: 1rem auto;
    padding: 0 10px;
  }
}

.right-panel-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  backdrop-filter: blur(3px);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.forecast-header h2 {
  margin-bottom: 10px;
}

.forecast-info {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #666;
}

.no-forecast-selected {
  text-align: center;
  color: #777;
  height: 100%; /* Растягиваем на всю высоту .viewer-area */
}

.error-display {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.error-display p {
  margin: 0;
}

.image-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
.image-controls label {
  font-weight: 600;
}
.image-controls .select-wrapper {
  max-width: 150px;
}
.image-controls select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  min-width: 120px; /* Чтобы селект не был слишком узким */
}

.total-maps-info {
  color: #333;
}
</style>