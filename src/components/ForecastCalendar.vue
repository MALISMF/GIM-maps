<template>
  <h2>Доступные даты прогнозов</h2>
  <div class="calendar-container">
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn" :disabled="!canGoPrev">&lt;</button>
      <span class="month-year">{{ monthYear }}</span>
      <button @click="nextMonth" class="nav-btn" :disabled="!canGoNext">&gt;</button>
    </div>
    <div class="calendar-grid">
      <div v-for="weekday in weekdays" :key="weekday" class="weekday">{{ weekday }}</div>
      <div v-for="blank in blanks" :key="`blank-${blank}`" class="blank-day"></div>
      <div
        v-for="day in daysInMonth"
        :key="day"
        :class="getClassesForDay(day)"
        @click="selectDate(day)"
      >
        {{ day }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    forecasts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['forecast-selected'],
  
  data() {
    const today = new Date();
    return {
      today,
      selectedDate: null,
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      minForecastDate: null,
      maxForecastDate: null,
    };
  },
  
  computed: {
    daysInMonth() {
      return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    },
    
    firstDayOfMonth() {
      let day = new Date(this.currentYear, this.currentMonth, 1).getDay();
      // Корректируем день недели: JS считает с ВС (0), нам нужен ПН (0)
      return day === 0 ? 6 : day - 1;
    },
    
    blanks() {
      const blankCount = this.firstDayOfMonth;
      return Array.from({ length: blankCount }, (_, i) => i);
    },
    
    monthYear() {
      const date = new Date(this.currentYear, this.currentMonth);
      return `${date.toLocaleString('ru', { month: 'long' })} ${this.currentYear}`;
    },
    
    // Создает множество дат (в формате 'YYYY-MM-DD'), для которых есть прогнозы.
    // Используется для быстрой проверки доступности даты.
    availableDates() {
      if (!this.forecasts || !Array.isArray(this.forecasts)) {
        return new Set();
      }
      
      const dates = new Set();
      this.forecasts.forEach(forecast => {
        const dateStr = forecast.forecast_start_date || forecast.forecast_end_date || 
                       forecast.date || forecast.created_at || forecast.timestamp;
        
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            const dateKey = date.getFullYear() + '-' + 
                           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(date.getDate()).padStart(2, '0');
            dates.add(dateKey);
          }
        }
      });
      return dates;
    },
    canGoPrev() {
      if (!this.minForecastDate) return false;
      const firstDayOfCurrentMonth = new Date(this.currentYear, this.currentMonth, 1);
      return firstDayOfCurrentMonth > this.minForecastDate;
    },
    canGoNext() {
      if (!this.maxForecastDate) return false;
      const lastDayOfCurrentMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
      return lastDayOfCurrentMonth < this.maxForecastDate;
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
      if (this.isDateAvailable(day)) {
        const clickedDate = new Date(this.currentYear, this.currentMonth, day);
        this.selectedDate = clickedDate;
        
        const selectedForecast = this.findForecastForDate(clickedDate);
        if (selectedForecast) {
          this.$emit('forecast-selected', selectedForecast);
        }
      }
    },
    
    isSelected(day) {
      if (!this.selectedDate) return false;
      return (
        this.selectedDate.getDate() === day &&
        this.selectedDate.getMonth() === this.currentMonth &&
        this.selectedDate.getFullYear() === this.currentYear
      );
    },
    
    isDateAvailable(day) {
      const dateKey = this.currentYear + '-' + 
                     String(this.currentMonth + 1).padStart(2, '0') + '-' + 
                     String(day).padStart(2, '0');
      return this.availableDates.has(dateKey);
    },
    
    getClassesForDay(day) {
      return [
        'calendar-day',
        {
          'selected': this.isSelected(day),
          'available': this.isDateAvailable(day),
          'clickable': this.isDateAvailable(day)
        }
      ];
    },
    
    findForecastForDate(date) {
      return this.forecasts.find(forecast => {
        const forecastDate = new Date(
          forecast.forecast_start_date || forecast.forecast_end_date || 
          forecast.date || forecast.created_at || forecast.timestamp
        );
        return forecastDate.toDateString() === date.toDateString();
      });
    },
    
    // Автоматически находит и выбирает самый первый доступный прогноз
    selectFirstAvailableForecast() {
      if (this.forecasts && this.forecasts.length > 0) {
        const sortedForecasts = [...this.forecasts].sort((a, b) => {
          const dateA = new Date(
            a.forecast_start_date || a.forecast_end_date || 
            a.date || a.created_at || a.timestamp
          );
          const dateB = new Date(
            b.forecast_start_date || b.forecast_end_date || 
            b.date || b.created_at || b.timestamp
          );
          return dateA - dateB;
        });
        
        const firstForecast = sortedForecasts[0];
        const firstDate = new Date(
          firstForecast.forecast_start_date || firstForecast.forecast_end_date || 
          firstForecast.date || firstForecast.created_at || firstForecast.timestamp
        );
        
        if (!isNaN(firstDate.getTime())) {
          this.selectedDate = firstDate;
          
          this.currentMonth = firstDate.getMonth();
          this.currentYear = firstDate.getFullYear();
          
          this.$emit('forecast-selected', firstForecast);
        }
      }
    },
    updateMinMaxDates() {
      if (!this.forecasts || this.forecasts.length === 0) {
        this.minForecastDate = null;
        this.maxForecastDate = null;
        return;
      }
      const dates = this.forecasts.map(f => new Date(f.forecast_start_date || f.date));
      this.minForecastDate = new Date(Math.min.apply(null, dates));
      this.maxForecastDate = new Date(Math.max.apply(null, dates));
    }
  },
  
  watch: {
    forecasts: {
      handler(newForecasts) {
        this.updateMinMaxDates();
        if (newForecasts && newForecasts.length > 0) {
          this.selectFirstAvailableForecast();
        } else {
          this.selectedDate = null;
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.calendar-container {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.month-year {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  color: #002033;
}
.nav-btn {
  background: none;
  border: 1px solid transparent;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 1.5rem;
  transition: background-color 0.2s, border-color 0.2s;
}
.nav-btn:hover {
  background-color: #f0f2f5;
  border-color: var(--border-color);
}
.nav-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
  background-color: transparent;
  border-color: transparent;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.weekday, .calendar-day, .blank-day {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 45px;
  text-align: center;
}
.weekday {
  font-weight: 500;
  color: #999;
  font-size: 0.8rem;
}
.calendar-day {
  cursor: default;
  color: #002033;
  font-size: 0.9rem;
}
.calendar-day.clickable {
  cursor: pointer;
  color: var(--text-color);
}
.calendar-day.available {
  background-color: #189F0B;
  color: white;
  font-weight: 500;
}
.calendar-day.available:not(.selected):hover {
  background-color: #21ca12;
}
.calendar-day.selected {
  background-color: #fff;
  color: var(--text-color);
  font-weight: 700;
  outline: 3px solid #f0ad4e;
  border-radius: 50%;
}
</style>