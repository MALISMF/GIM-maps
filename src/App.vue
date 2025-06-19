<script>
import ModelList from './components/ModelList.vue'
import ForecastCalendar from './components/ForecastCalendar.vue'
export default {
  name: 'App',
  components: {
    ModelList,
    ForecastCalendar
  }
}
</script>

<template>
  <div id="app">
    <h1>GIM-карты: Список моделей</h1>
    <ModelList />
    <ForecastCalendar/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 2rem auto;
  max-width: 600px;
}
</style>
