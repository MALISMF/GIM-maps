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
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
}
.download-btn {
  padding: 10px 20px;
  font-size: 1rem;
  color: #333;
  background-color: #f0f2f5;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.download-btn:hover:not(:disabled) {
  background-color: #e3e8ee;
}
.download-btn:disabled {
  background-color: #f8f9fa;
  color: #aaa;
  cursor: not-allowed;
}
.btn-content {
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s ease-in-out infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Адаптивность */
@media (max-width: 768px) {
  .download-btn {
    width: 100%;
    font-size: 14px;
    padding: 10px 16px;
  }
  
  .download-npz {
    margin-top: 15px;
    padding: 12px;
  }
}
</style>
