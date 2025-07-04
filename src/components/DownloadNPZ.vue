<template>
  <div class="download-npz">
    <button 
      @click="downloadNPZ" 
      :disabled="!forecastId || isLoading"
      class="download-btn"
    >
      <span v-if="isLoading" class="btn-content">
        <span class="btn-spinner"></span>
        Скачивание...
      </span>
      <span v-else-if="success" class="btn-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        Готово!
      </span>
      <span v-else class="btn-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        Скачать *.npz файл
      </span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'DownloadNPZ',
  props: {
    forecastId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      error: null,
      success: false,
      isLoading: false,
      baseUrl: 'https://services.simurg.space/gim-tec-forecast'
    }
  },
  methods: {
    async downloadNPZ() {
      if (!this.forecastId || this.isLoading) return;
      this.error = null;
      this.success = false;
      this.isLoading = true;
      try {
        const response = await fetch(`${this.baseUrl}/get_forecast_object/${this.forecastId}`, {
          method: 'GET',
          headers: { 'Accept': 'application/zip, application/octet-stream' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const npzBlob = await response.blob();
        this.downloadBlob(npzBlob, `forecast_${this.forecastId}.npz`);
        this.success = true;
        setTimeout(() => { this.success = false; }, 2000); // Состояние "Готово" на 2 секунды
      } catch (error) {
        // Ошибки теперь обрабатываются глобально
      } finally {
        this.isLoading = false;
      }
    },

    // Создает временную ссылку для скачивания Blob-объекта
    downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    }
  }
}
</script>

<style scoped>
.download-npz {
  display: block;
  width: 100%;
  max-width: none;
  margin: 16px 0 0 0;
  box-sizing: border-box;
  padding: 0;
  animation: slideUp 0.3s ease-out;
}

.download-btn {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: block;
  padding: var(--spacing-md, 16px) var(--spacing-lg, 20px);
  font-size: var(--font-size-md, 1rem);
  color: var(--text-color, #333);
  background-color: #e4e9eb;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.download-btn:hover:not(:disabled) {
  background-color: var(--primary-color, #007bff);
  color: white;
  border-color: var(--primary-color, #007bff);
  transform: translateY(-1px);
}

.download-btn:active:not(:disabled) {
  transform: translateY(0);
}

.download-btn:disabled {
  background-color: #f8f9fa;
  color: #aaa;
  cursor: not-allowed;
  border-color: #eee;
  transform: none;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  justify-content: center;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s ease-in-out infinite;
  will-change: transform;
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

/* Адаптивность для планшетов */
@media (max-width: 1024px) {
  .download-npz {
    margin-top: var(--spacing-md, 16px);
    padding: 0 var(--spacing-xs, 8px);
  }
  
  .download-btn {
    padding: var(--spacing-sm, 12px) var(--spacing-md, 16px);
    font-size: var(--font-size-sm, 0.875rem);
    min-height: 44px;
  }
  
  .btn-content {
    gap: var(--spacing-xs, 8px);
  }
  
  .btn-spinner {
    width: 18px;
    height: 18px;
  }
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .download-npz {
    margin: 12px 0 0 0;
  }
  .download-btn {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    display: block;
    font-size: var(--font-size-sm, 0.875rem);
    padding: var(--spacing-md, 16px) var(--spacing-sm, 12px);
    min-height: 48px;
  }
  
  .btn-content {
    gap: var(--spacing-xs, 8px);
  }
  
  .btn-spinner {
    width: 18px;
    height: 18px;
  }
}

/* Адаптивность для очень маленьких экранов */
@media (max-width: 480px) {
  .download-npz {
    margin-top: var(--spacing-xs, 8px);
    padding: 0 var(--spacing-xs, 8px);
  }
  
  .download-btn {
    font-size: var(--font-size-xs, 0.75rem);
    padding: var(--spacing-sm, 12px) var(--spacing-xs, 8px);
    min-height: 44px;
  }
  
  .btn-content {
    gap: var(--spacing-xs, 8px);
  }
  
  .btn-spinner {
    width: 16px;
    height: 16px;
  }
}

/* Улучшения для touch-устройств */
@media (hover: none) and (pointer: coarse) {
  .download-btn {
    min-height: 48px;
    border-width: 2px;
  }
  
  .download-btn:hover:not(:disabled) {
    transform: none;
  }
  
  .download-btn:active:not(:disabled) {
    background-color: var(--primary-color, #007bff);
    color: white;
    transform: scale(0.98);
  }
}

/* Анимации для плавного появления */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Улучшения для фокуса */
.download-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.download-btn:focus:not(:focus-visible) {
  box-shadow: var(--shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
}

/* Улучшения для медленных соединений */
.download-btn {
  will-change: transform, box-shadow;
}
</style>
