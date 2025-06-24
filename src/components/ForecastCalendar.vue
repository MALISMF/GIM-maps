<template>
  <h2>Доступные даты прогнозов</h2>
  <div class="calendar-container">
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn" :disabled="!canGoPrev"><img src = "../assets/icons/Vector.svg"</button>
      <span class="month-year">{{ monthYear }}</span>
      <button @click="nextMonth" class="nav-btn" :disabled="!canGoNext"><img src = "../assets/icons/IconForward.svg"></button>
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
  max-width: 100%;
  margin: 0 auto;
  background-color: var(--panel-background, #ffffff);
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 8px);
  padding: var(--spacing-lg, 20px);
  /* box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.1)); */
}

.calendar-container h2 {
  margin: 0 0 var(--spacing-md, 16px) 0;
  font-size: var(--font-size-xl, 1.25rem);
  color: var(--text-color, #333);
  text-align: center;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md, 16px);
  padding: 0 var(--spacing-xs, 8px);
}

.month-year {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: var(--font-size-lg, 1.125rem);
  color: #002033;
  text-align: center;
  flex: 1;
}

.nav-btn {
  background: none;
  border: none;
  padding: var(--spacing-xs, 8px) var(--spacing-sm, 12px);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  background-color: rgb(229, 232, 236);
  border-radius: 5px;
  transform: scale(120%);
}

.nav-btn:disabled {
  cursor: default;
  background-color: transparent;
  filter: opacity(0.5);
  border-color: #eee;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.weekday, .calendar-day, .blank-day {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  text-align: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.weekday {
  font-weight: 600;
  color: #b3bcc2;
  font-size: var(--font-size-xs, 0.75rem);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-day {
  cursor: default;
  color: #002033;
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  position: relative;
  border: 1px solid transparent;
}

.calendar-day.clickable {
  cursor: pointer;
  color: var(--text-color, #333);
}

.calendar-day.clickable:hover {
  background-color: var(--background-color, #f0f2f5);
  border-color: var(--border-color, #ddd);
}

.calendar-day.available {
  background-color: #189F0B;
  color: white;
  font-weight: 600;
  border-color: #189F0B;
}

.calendar-day.available:not(.selected):hover {
  background-color: #21ca12;
  border-color: #21ca12;
  transform: scale(1.05);
}

.calendar-day.selected.available {
  background-color: #189F0B;
  color: #189F0B;
  font-weight: 700;
  position: relative;
  z-index: 1;
  border-color: #189F0B;
}

.calendar-day.selected.available::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  background-color: #fdf6c3;
  border-radius: 50%;
  z-index: -1;
}

.blank-day {
  background-color: transparent;
}

/* Адаптивность для планшетов */
@media (max-width: 1024px) {
  .calendar-container {
    padding: var(--spacing-md, 16px);
  }
  
  .calendar-container h2 {
    font-size: var(--font-size-lg, 1.125rem);
  }
  
  .month-year {
    font-size: var(--font-size-md, 1rem);
  }
  
  .nav-btn {
    font-size: var(--font-size-md, 1rem);
    min-width: 36px;
    min-height: 36px;
  }
  
  .weekday, .calendar-day, .blank-day {
    height: 36px;
  }
  
  .weekday {
    font-size: var(--font-size-xs, 0.75rem);
  }
  
  .calendar-day {
    font-size: var(--font-size-xs, 0.75rem);
  }
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .calendar-container {
    padding: var(--spacing-sm, 12px);
  }
  
  .calendar-container h2 {
    font-size: var(--font-size-md, 1rem);
    margin-bottom: var(--spacing-sm, 12px);
  }
  
  .calendar-header {
    margin-bottom: var(--spacing-sm, 12px);
  }
  
  .month-year {
    font-size: var(--font-size-sm, 0.875rem);
  }
  
  .nav-btn {
    font-size: var(--font-size-sm, 0.875rem);
    min-width: 40px;
    min-height: 40px;
    padding: var(--spacing-xs, 8px);
  }
  
  .weekday, .calendar-day, .blank-day {
    height: 40px;
  }
  
  .weekday {
    font-size: var(--font-size-xs, 0.75rem);
  }
  
  .calendar-day {
    font-size: var(--font-size-sm, 0.875rem);
  }
  
  .calendar-day.selected.available::before {
    width: 32px;
    height: 32px;
  }
}

/* Адаптивность для очень маленьких экранов */
@media (max-width: 480px) {
  .calendar-container {
    padding: var(--spacing-xs, 8px);
  }
  
  .calendar-container h2 {
    font-size: var(--font-size-sm, 0.875rem);
  }
  
  .month-year {
    font-size: var(--font-size-xs, 0.75rem);
  }
  
  .nav-btn {
    font-size: var(--font-size-xs, 0.75rem);
    min-width: 36px;
    min-height: 36px;
    padding: var(--spacing-xs, 6px);
  }
  
  .weekday, .calendar-day, .blank-day {
    height: 32px;
  }
  
  .weekday {
    font-size: var(--font-size-xs, 0.75rem);
  }
  
  .calendar-day {
    font-size: var(--font-size-xs, 0.75rem);
  }
  
  .calendar-day.selected.available::before {
    width: 24px;
    height: 24px;
  }
}

/* Улучшения для touch-устройств */
@media (hover: none) and (pointer: coarse) {
  .nav-btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  .calendar-day.clickable {
    min-height: 44px;
  }
  
  .calendar-container {
    border-width: 2px;
  }
}
</style>