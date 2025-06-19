<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="prevMonth">&#8592;</button>
      <span>{{ monthYear }}</span>
      <button @click="nextMonth">&#8594;</button>
    </div>
    <div class="calendar-weekdays">
      <span v-for="day in weekdays" :key="day">{{ day }}</span>
    </div>
    <div class="calendar-days">
      <span
        v-for="blank in blanks"
        :key="'b' + blank"
        class="calendar-day blank"
      ></span>
      <span
        v-for="day in daysInMonth"
        :key="day"
        :class="['calendar-day', { selected: isSelected(day) }]"
        @click="selectDate(day)"
      >
        {{ day }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const today = new Date();
const selectedDate = ref(new Date());
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const firstDayOfMonth = computed(() => {
  // JS: 0 - Sunday, 1 - Monday ...
  let day = new Date(currentYear.value, currentMonth.value, 1).getDay();
  return day === 0 ? 6 : day - 1; // Make Monday first
});

const blanks = computed(() => Array.from({ length: firstDayOfMonth.value }, (_, i) => i));

const monthYear = computed(() => {
  return `${today.toLocaleString('ru', { month: 'long' })} ${currentYear.value}`;
});

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

function selectDate(day) {
  selectedDate.value = new Date(currentYear.value, currentMonth.value, day);
}

function isSelected(day) {
  return (
    selectedDate.value.getDate() === day &&
    selectedDate.value.getMonth() === currentMonth.value &&
    selectedDate.value.getFullYear() === currentYear.value
  );
}
</script>

<style scoped>
.calendar {
  width: 320px;
  margin: auto;
  margin-top: 50px;
  color: black;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 4px;
}
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.calendar-day {
  height: 32px;
  line-height: 32px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}
.calendar-day.selected {
  background: #42b983;
  color: #fff;
}
.calendar-day.blank {
  background: transparent;
  cursor: default;
}
.calendar-day:hover:not(.blank):not(.selected) {
  background: #e6f7f1;
}
</style>
