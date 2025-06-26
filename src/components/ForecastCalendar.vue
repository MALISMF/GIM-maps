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

<script>
export default {
  props: {
    forecast: {
      type: Object,
      default: null
    }
  },
  data() {
    const today = new Date();
    return {
      today,
      selectedDate: new Date(),
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    };
  },
  computed: {
    daysInMonth() {
      return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    },
    firstDayOfMonth() {
      let day = new Date(this.currentYear, this.currentMonth, 1).getDay();
      return day === 0 ? 6 : day - 1;
    },
    blanks() {
      return Array.from({ length: this.firstDayOfMonth }, (_, i) => i);
    },
    monthYear() {
        const date = new Date(this.currentYear, this.currentMonth);
        return `${date.toLocaleString('ru', { month: 'long' })} ${this.currentYear}`;
    }
  },
  methods: {
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },
    selectDate(day) {
      this.selectedDate = new Date(this.currentYear, this.currentMonth, day);
    },
    isSelected(day) {
      return (
        this.selectedDate.getDate() === day &&
        this.selectedDate.getMonth() === this.currentMonth &&
        this.selectedDate.getFullYear() === this.currentYear
      );
    }
  },

  watch: {
  forecast(forecasts){
    if (forecasts) {
      // Например, выделить дату
      console.log('Выделяем дату:', forecasts);
    }
  }
    }

};
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
