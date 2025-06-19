<script>
import ModelList from './components/ModelList.vue'

export default {
  name: 'App',
  components: {
    ModelList
  }
}
</script>

<template>
  <div id="app">
    <h1>GIM-карты: Список моделей</h1>
    <ModelList />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 2rem auto;
  max-width: 600px;
}
</style>
