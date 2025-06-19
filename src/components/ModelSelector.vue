<template>
  <div>
    <h2>Список моделей</h2>
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" style="color: red">Ошибка: {{ error }}</div>
    <div v-else>
      <select v-model="selected" style="min-width: 250px;" >
        <option value="" disabled>Выберите модель...</option>
        <option v-for="model in models" :key="model" :value="model">{{ model }}</option>
      </select>
      <div v-if="selected" style="margin-top: 1rem;">
        <strong>Выбрана модель:</strong> {{ selected }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ModelList',
  data() {
    return {
      models: [],
      loading: true,
      error: null,
      selected: ''
    }
  },
  mounted() {
    axios.get('https://services.simurg.space/gim-tec-forecast/models')
      .then(res => {
        this.models = Array.isArray(res.data) ? res.data : (res.data.models || [])
        this.selected = this.models[0]
      })
      .catch(err => {
        this.error = err.message
      })
      .finally(() => {
        this.loading = false
      })
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