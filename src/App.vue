<template>
  <div id="app">
    <h1>GIM-карты: Список моделей</h1>
    <!--selected-model событие передается эмитом из ModelList и запускает onModelSelected--> 
    <ModelList
      @selected-model="onModelSelected"
      @model-forecasts="onModelForecasts"
    />
    <ForecastCalendar :forecast="forecasts[0] || null" />
  </div>
</template>

<script>
import ModelList from './components/ModelList.vue'
import ForecastCalendar from './components/ForecastCalendar.vue'

export default {
  name: 'App',
  components: {
    ModelList,
    ForecastCalendar
  }, 

  data() {
    return {
      selectedModel: '',
      forecasts: []
    }
  },

  methods: {
    onModelSelected(model){
      this.selectedModel = model;
    },

    onModelForecasts(modelForecasts) {
      this.forecasts = modelForecasts;
      console.log(this.forecasts)
    }
  }
}
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 2rem auto;
  max-width: 600px;
}
</style>