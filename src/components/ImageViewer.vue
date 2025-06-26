<template>
  <div class="image-viewer">
    <div class="image-container">
      <!-- Оверлей загрузки, который накладывается поверх контента -->
      <div v-if="isImageLoading && !isPanelLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Загрузка GIM-карты...</p>
      </div>
      
      <!-- Изображение и альтернативные состояния -->
      <img
        v-if="currentImage"
        :src="currentImage"
        alt="GIM-карта"
        class="gim-image"
        :class="{ 'loading': isImageLoading && !isPanelLoading }"
      />

      <div v-else-if="!currentImage" class="no-image">
        <p>Изображение не загружено</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageViewer',
  props: {
    forecastId: { type: [String, Number], required: true },
    isPanelLoading: { type: Boolean, default: false },
    selectedShift: { type: Number, required: true }
  },
  emits: ['image-error', 'image-loaded'],
  data() {
    return {
      currentImage: null,
      isImageLoading: false,
      imageError: null,
      baseUrl: 'https://services.simurg.space/gim-tec-forecast'
    };
  },
  watch: {
    selectedShift: {
      handler(newShift) {
        this.loadImage(newShift);
      },
      immediate: true
    }
  },
  methods: {
    async loadImage(shift) {
      if (!this.forecastId) return;
      this.isImageLoading = true;
      this.imageError = null;
      try {
        const imageUrl = `${this.baseUrl}/get_forecast_image/${this.forecastId}?shift=${shift}`;
        const img = new Image();
        img.onload = () => {
          this.currentImage = imageUrl;
          this.isImageLoading = false;
          this.$emit('image-loaded');
        };
        img.onerror = () => {
          this.imageError = 'Не удалось загрузить изображение.';
          this.isImageLoading = false;
          this.$emit('image-error', this.imageError);
        };
        img.src = `${imageUrl}&t=${Date.now()}`;
      } catch (error) {
        this.imageError = 'Произошла критическая ошибка.';
        this.isImageLoading = false;
        this.$emit('image-error', this.imageError);
      }
    }
  }
};
</script>

<style scoped>
.image-viewer {
  width: 100%;
}

.image-container {
  position: relative; /* Важно для позиционирования оверлея */
  width: 600px;  /* Фиксированная ширина */
  height: 600px; /* Фиксированная высота */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.gim-image {
  width: 100%;   /* Растягиваем на всю ширину контейнера */
  height: 100%;  /* Растягиваем на всю высоту контейнера */
  object-fit: contain;
  display: block;
  transition: filter 0.2s ease-out;
}

.gim-image.loading {
  filter: blur(4px) brightness(0.8);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--primary-color);
  animation: spin 1s ease infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.no-image {
  text-align: center;
  color: #777;
}
</style>