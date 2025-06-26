<template>
  <div class="image-viewer">
    <!-- Заголовок -->
    <div class="viewer-header">
      <h3>GIM-карта прогноза</h3>
      <div v-if="forecastSize > 0" class="shift-selector">
        <label for="shift-select">Номер карты:</label>
        <select 
          id="shift-select" 
          v-model="selectedShift" 
          @change="onShiftChange"
          :disabled="loading"
        >
          <option 
            v-for="shift in forecastSize" 
            :key="shift - 1" 
            :value="shift - 1"
          >
            {{ shift - 1 }} ({{ getShiftTime(shift - 1) }})
          </option>
        </select>
        <span class="shift-info">Всего карт: {{ forecastSize }}</span>
      </div>
    </div>

    <!-- Прогресс-бар загрузки -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Контейнер изображения -->
    <div class="image-container" :class="{ 'loading': loading }">
      <div v-if="!currentImage && !loading" class="no-image">
        <p>Выберите прогноз для загрузки GIM-карты</p>
      </div>
      
      <img 
        v-if="currentImage && !loading" 
        :src="currentImage" 
        :alt="`GIM-карта, смена ${selectedShift}`"
        class="gim-image"
        @load="onImageLoad"
        @error="onImageError"
      />
      
      <div v-if="imageError" class="error-message">
        <p>Ошибка загрузки изображения: {{ imageError }}</p>
        <button @click="retryLoad" class="retry-btn">Повторить</button>
      </div>
    </div>

    <!-- Информация о текущем изображении -->
    <div v-if="currentImage && !loading" class="image-info">
      <p><strong>Номер карты:</strong> {{ selectedShift }}</p>
      <p><strong>Время прогноза:</strong> {{ getShiftTime(selectedShift) }}</p>
      <button @click = "goright">go right</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageViewer',
  
  props: {
    forecastId: {
      type: [String, Number],
      default: null
    },
    forecastSize: {
      type: Number,
      default: 0
    }
  },

  emits: ['image-loaded', 'image-error', 'update:forecast-size'],

  data() {
    return {
      selectedShift: 0,
      currentImage: null,
      loading: false,
      loadingMessage: 'Загрузка GIM-карты...',
      progressPercent: 0,
      imageError: null,
      baseUrl: 'https://services.simurg.space/gim-tec-forecast'
    }
  },

  watch: {
    forecastId: {
      handler(newId) {
        if (newId) {
          this.loadForecastSize();
        } else {
          this.resetViewer();
        }
      },
      immediate: true
    }
  },

  methods: {
    async loadForecastSize() {
      if (!this.forecastId) return;
      
      this.loading = true;
      this.loadingMessage = 'Получение размера прогноза...';
      this.progressPercent = 10;
      
      try {
        const response = await fetch(`${this.baseUrl}/get_forecast_size/${this.forecastId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const size = data.size || data.forecast_size || data.total_shifts || 24; // По умолчанию 24
        
        // Обновляем размер прогноза в родительском компоненте
        this.$emit('update:forecast-size', size);
        
        this.progressPercent = 30;
        this.loadingMessage = 'Загрузка первой GIM-карты...';
        
        // Загружаем первую карту
        await this.loadImage(0);
        
      } catch (error) {
        console.error('Ошибка получения размера прогноза:', error);
        this.imageError = `Не удалось получить размер прогноза: ${error.message}`;
        this.$emit('image-error', this.imageError);
      } finally {
        this.loading = false;
        this.progressPercent = 0;
      }
    },

    async loadImage(shift) {
      if (!this.forecastId) return;
      
      this.loading = true;
      this.loadingMessage = `Загрузка GIM-карты (смена ${shift})...`;
      this.progressPercent = 50;
      this.imageError = null;
      
      try {
        const imageUrl = `${this.baseUrl}/get_forecast_image/${this.forecastId}?shift=${shift}`;
        
        // Создаем новый объект Image для предварительной загрузки
        const img = new Image();
        
        img.onload = () => {
          this.currentImage = imageUrl;
          this.progressPercent = 100;
          this.loading = false;
          this.$emit('image-loaded', {
            shift,
            imageUrl
          });
        };
        
        img.onerror = () => {
          throw new Error('Не удалось загрузить изображение');
        };
        
        // Добавляем timestamp для избежания кэширования
        img.src = `${imageUrl}&t=${Date.now()}`;
        
      } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        this.imageError = `Ошибка загрузки изображения: ${error.message}`;
        this.loading = false;
        this.progressPercent = 0;
        this.$emit('image-error', this.imageError);
      }
    },

    onShiftChange() {
      this.loadImage(this.selectedShift);
    },

    onImageLoad() {
      console.log('Изображение успешно загружено');
    },

    onImageError() {
      this.imageError = 'Ошибка отображения изображения';
      this.$emit('image-error', this.imageError);
    },

    retryLoad() {
      this.loadImage(this.selectedShift);
    },

    resetViewer() {
      this.currentImage = null;
      this.selectedShift = 0;
      this.loading = false;
      this.imageError = null;
      this.progressPercent = 0;
    },

    getShiftTime(shift) {
      // Конвертируем номер смены в время (каждая смена = 1 час)
      const hours = shift;
      const minutes = 0;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    },

    goright() {
      this.selectedShift += 1;
      this.onShiftChange()
    }
  }
}
</script>

<style scoped>
.image-viewer {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  position: relative;
  min-height: 400px;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.viewer-header h3 {
  margin: 0;
  color: #333;
}

.shift-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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
  color: black;
  font-size: 14px;
  min-width: 120px;
}

.shift-selector select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.shift-info {
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.loading-content {
  text-align: center;
  padding: 20px;
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

.progress-bar {
  width: 200px;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px auto 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.image-container {
  position: relative;
  min-height: 300px;
  margin: auto;
  width: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
}

.image-container.loading {
  border-color: #007bff;
  background: #f8f9ff;
}

.no-image {
  text-align: center;
  color: #666;
}

.no-image p {
  margin: 30px;
  font-size: 16px;
}

.gim-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.error-message {
  text-align: center;
  color: #dc3545;
  padding: 20px;
}

.error-message p {
  margin: 0 0 15px 0;
}

.retry-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #c82333;
}

.image-info {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.image-info p {
  margin: 5px 0;
  color: #555;
}

/* Адаптивность */
@media (max-width: 768px) {
  .viewer-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .shift-selector {
    width: 100%;
    justify-content: space-between;
  }
  
  .image-container {
    min-height: 200px;
  }
  
  .gim-image {
    max-height: 300px;
  }
}
</style>