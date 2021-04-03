<template>
  <v-app>
    <v-sheet class="calendar">
      <template v-if="loadingState.data === false && Array.isArray(weekends)">
        <div class="calendar__top">
          <v-btn
            icon
            class="ma-2"
            @click="$refs.calendar.prev()"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>

          <div class="calendar__currentMonth">
            {{ monthAndYear }}
          </div>

          <v-btn
            icon
            class="ma-2"
            @click="$refs.calendar.next()"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>

        <div class="calendar__body">
          <v-calendar ref="calendar"
                      v-model="currentDate"
                      type="month"
                      :hide-header="false"
                      :show-month-on-first="false"
                      :weekday-format="weekdayFormat"
          >
            <template v-slot:day-label="{ date, day, month }">
              <template v-if="new Date(currentDate).getMonth() + 1 === month">
                <v-btn
                  fab
                  x-small
                  primary
                  background-color="red"
                  elevation="0"
                  :color="checkStateDay(date) ? 'blue' : 'transparent'"
                  :dark="checkStateDay(date)"
                  @click="selectDate(date)"
                >
                  {{ day }}
                </v-btn>
              </template>
              <template v-else>
                <span />
              </template>
            </template>
          </v-calendar>
        </div>

        <div class="calendar__bottom">
          <v-btn class="mr-4"
                 :loading="loadingState.reset"
                 @click="resetData()"
          >
            Reset
          </v-btn>

          <v-btn color="primary"
                 :loading="loadingState.save"
                 @click="saveData()"
          >
            Save
          </v-btn>
        </div>
      </template>

      <v-progress-circular
        v-else
        class="calendar__loader"
        indeterminate
        color="primary"
      />
    </v-sheet>

    <v-snackbar v-model="snackbar.status"
                :timeout="snackbar.timeout"
                :color="snackbar.color"
                absolute
                top
                right
                text
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',

  components: {},

  data() {
    return {
      currentDate: new Date().toLocaleDateString('en-CA'),
      weekdaysTitle: ['m', 't', 'w', 't', 'f', 's', 's'],
      weekends: null,
      weekendsOriginal: null,

      snackbar: {
        status: false,
        text: '',
        timeout: 2000,
        color: 'primary',
      },

      loadingState: {
        data: false,
        reset: false,
        save: false
      },
    }
  },

  computed: {
    monthAndYear() {
      const date = new Date(this.currentDate)
      return `${date.toLocaleString('en-CA', {month: 'long'})} ${date.getFullYear()}`
    },
  },

  async created() {
    this.loadingState.data = true;
    await this.fetchData();
    this.loadingState.data = false;
  },

  methods: {
    weekdayFormat(e) {
      return this.weekdaysTitle[e.weekday]
    },

    selectDate(date) {
      const findIndex = this.weekends.findIndex(item => item.date === date);

      if (findIndex === -1) {
        this.weekends.push({date: date, value: true})
      } else {
        const findItem = this.weekends[findIndex];

        if (findItem.value) {
          this.weekendsOriginal.includes(date)
            ? findItem.value = false
            : this.weekends.splice(findIndex, 1)
        } else {
          findItem.value = true;
        }
      }
    },

    checkStateDay(date) {
      return !!this.weekends.filter(item => item.date === date && item.value === true).length
    },

    async fetchData() {
      await axios.get('http://test.unit.homestretch.ch/')
        .then(res => this.setData(res.data))
        .catch(err => {
          this.showSnackbar('Weekends update error!', 'red');
          console.error(err);
        })
    },

    setData(data) {
      if (Array.isArray(data)) {
        this.weekendsOriginal = data;
        this.weekends = data.map(item => ({date: item, value: true}));
      }
    },

    async saveData() {
      if (Array.isArray(this.weekends)) {
        const data = JSON.stringify(this.weekends);
        const axiosOptions = {
          headers: {
            'Content-Type': 'application/json'
          }
        }

        this.loadingState.save = true;

        await axios.post('http://test.unit.homestretch.ch/save', data, axiosOptions)
          .then(res => this.setData(res.data))
          .catch(err => {
            this.showSnackbar('Weekends update error!', 'red')
            console.error(err)
          })

        this.loadingState.save = false;
        this.showSnackbar('Weekends save')
      }
    },

    async resetData() {
      this.loadingState.reset = true;
      await this.fetchData();
      this.loadingState.reset = false;
      this.showSnackbar('Weekends reset')
    },

    showSnackbar(text, color = 'primary') {
      if (text) {
        this.snackbar.text = text;
        this.snackbar.color = color;
        this.snackbar.status = true;
      }
    }
  }
};
</script>

<style lang="scss">
.calendar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  width: 300px;
  margin: 40px auto 0;

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 10px;
  }

  &__currentMonth {
    font-weight: 500;
  }

  &__body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 250px;
    margin: 0 0 10px;
  }

  &__bottom {
    display: flex;
    justify-content: flex-end;
  }

  &__loader {
    margin: 0 auto;
  }
}

#app .v-calendar-weekly {
  border: none;

  &__day {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 38px;

    border: none;
    background: none;
  }

  &__head-weekday {
    border: none;
    color: darkgray;
    text-transform: uppercase;

    &.v-past {
      background: none;
    }
  }
}
</style>
