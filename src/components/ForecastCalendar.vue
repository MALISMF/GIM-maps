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
          :class="getClassesForDay(day)"
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
        weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
      };
    },
    
    computed: {
      daysInMonth() {
        return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
      },
      
      firstDayOfMonth() {
        let day = new Date(this.currentYear, this.currentMonth, 1).getDay();
        // Переводим с воскресенья=0 на понедельник=0
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
      
      // Получаем доступные даты из прогнозов
      availableDates() {
        if (!this.forecasts || !Array.isArray(this.forecasts)) {
          return new Set();
        }
        
        const dates = new Set();
        this.forecasts.forEach(forecast => {
          // Используем поля из реального API
          const dateStr = forecast.forecast_start_date || forecast.forecast_end_date || 
                         forecast.date || forecast.created_at || forecast.timestamp;
          
          if (dateStr) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              // Приводим к формату YYYY-MM-DD для сравнения
              const dateKey = date.getFullYear() + '-' + 
                             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(date.getDate()).padStart(2, '0');
              dates.add(dateKey);
            }
          }
        });
        return dates;
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
        const clickedDate = new Date(this.currentYear, this.currentMonth, day);
        
        // Проверяем, есть ли прогноз для этой даты
        if (this.isDateAvailable(day)) {
          this.selectedDate = clickedDate;
          
          // Находим соответствующий прогноз и передаем его родительскому компоненту
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
      
      // Автоматически выбираем первый доступный прогноз
      selectFirstAvailableForecast() {
        if (this.forecasts && this.forecasts.length > 0) {
          // Сортируем прогнозы по дате
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
          
          // Проверяем, что дата валидна
          if (!isNaN(firstDate.getTime())) {
            // Устанавливаем выбранную дату
            this.selectedDate = firstDate;
            
            // Переключаем календарь на месяц с первым прогнозом
            this.currentMonth = firstDate.getMonth();
            this.currentYear = firstDate.getFullYear();
            
            // Эмитим событие выбора прогноза
            this.$emit('forecast-selected', firstForecast);
            
            console.log('Автоматически выбран прогноз:', firstForecast);
            console.log('Дата прогноза:', firstDate);
          }
        }
      }
    },
    
    watch: {
      forecasts: {
        handler(newForecasts) {
          if (newForecasts && newForecasts.length > 0) {
            console.log('Получены прогнозы:', newForecasts);
            console.log('Первый прогноз:', newForecasts[0]);
            console.log('Доступные даты:', Array.from(this.availableDates));
            
            // Автоматически выделяем первый доступный прогноз
            this.selectFirstAvailableForecast();
          } else {
            console.log('Прогнозы пусты или отсутствуют');
            this.selectedDate = null;
          }
        },
        immediate: true
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
    border-radius: 4px;
    transition: background 0.2s;
    cursor: default;
  }
  
  .calendar-day.blank {
    background: transparent;
    cursor: default;
  }
  
  /* Доступные для выбора дни (зеленый фон) */
  .calendar-day.available {
    background: #e6f7e6;
    color: #2d5a2d;
    cursor: pointer;
    border: 2px solid #42b983;
  }
  
  /* Выбранный день (кружочек) */
  .calendar-day.selected {
    background: #42b983;
    color: #fff;
    font-weight: bold;
  }
  
  /* Ховер для доступных дней */
  .calendar-day.clickable:hover:not(.selected) {
    background: #d4edda;
    transform: scale(1.05);
  }
  
  /* Недоступные дни остаются серыми */
  .calendar-day:not(.available):not(.blank) {
    background: #f8f9fa;
    
color: #6c757d;
    cursor: not-allowed;
  }
  </style>