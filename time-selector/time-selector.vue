<template>
  <div class="dingtime">
    <span class="date-picker">
      <Select v-model="date" placeholder="请选择定时发送日期" size="small" @change="handleDateChange">
        <Option v-for="(item, index) in dateOptions"
          style="padding-left: 30px "
          :label="item.label"
          :key="index"
          :value="item.value">
        </Option>
      </Select>
    </span>
    <span class="hour-picker">
      <Select v-model="hour" placeholder="选择时" size="small" @change="handleHourChange">
        <Option v-for="(item, index) in hourOptions"
          style="padding-left: 30px "
          :key="index"
          :label="item.label"
          :value="item.value">
        </Option>
      </Select>
    </span>
    <span style="line-height: 2rem;">时</span>
    <span class="minute-picker">
        <Select v-model="minute" placeholder="选择分" size="small">
          <Option v-for="(item, index) in minuteOptions"
            :key="index"
            :label="item.label"
            :value="item.value">
          </Option>
        </Select>
    </span>
    <span style="line-height: 2rem;">分</span>
  </div>
</template>

<script>
import { formatDate } from '@common/utils/dateutils';

const MIN_DELAY_MINUTE = 5;

export default {
  name: 'time-selector',
  data() {
    return {
      date: '',
      hour: '',
      minute: '',
      dateOptions: [],
      hourOptions: [],
      minuteOptions: []
    }
  },
  created() {
    this.initTimeOptions();
  },
  methods: {
    getTimeStamp() {
      let date = new Date(this.date);
      date.setHours(this.hour);
      date.setMinutes(this.minute);
      return date.getTime();
    },
    getSelectData() {
      return {date: this.date, hour: this.hour, minute: this.minute}
    },
    initTimeOptions() {
      this.initDateOptions();
      this.initHourOptions();
      this.initMinuteOptions();
    },
    handleDateChange() {
      let currentDate = new Date();
      let isToday = new Date(this.date).getDate() === currentDate.getDate();
      if (isToday) {
        this.changeHourOptions(currentDate.getHours());
        this.updateHour();
        let isFirstVisibleHour = this.hour === this.hourOptions[0].value;
        if (isFirstVisibleHour) {
          this.changeMinuteOptions(currentDate.getMinutes());
          this.updateMinute();
        }
      } else {
        this.initHourOptions();
        this.initMinuteOptions();
      }
    },
    handleHourChange() {
      let currentDate = new Date();
      let isToday = new Date(this.date).getDate() === currentDate.getDate();
      let isFirstVisibleHour = this.hour === this.hourOptions[0].value;
      if (isToday && isFirstVisibleHour) {
        this.changeMinuteOptions(currentDate.getMinutes());
        this.updateMinute();
      } else {
        this.initMinuteOptions();
      }
    },
    updateHour() {
      if (this.hour < this.hourOptions[0].value && this.hour !== '') {
        this.hour = this.hourOptions[0].value;
      }
    },
    updateMinute() {
      let isMinuteLess = this.minute < this.minuteOptions[0].value + MIN_DELAY_MINUTE;
      if ( isMinuteLess && this.minute !== '') {
        this.minute = this.minuteOptions[0].value
      };
    },
    changeDateOptions() {
      this.dateOptions = this.dateOptions.slice(1);
    },
    changeHourOptions(currentHour = 0) {
      this.hourOptions = new Array(24 - currentHour).fill(0).map((item, index) => {
        return { value: currentHour + index, label: `0${currentHour + index}`.slice(-2) }
      });
    },
    changeMinuteOptions(currentMinute = 0) {
      let minVisibleMinute = currentMinute + MIN_DELAY_MINUTE;

      if (this.isMinuteOverflow(minVisibleMinute)) {
        this.handleMinuteOverflow(minVisibleMinute);
        return;
      }
      this.minuteOptions = new Array(60 - minVisibleMinute).fill(0).map((item, index) => {
        return { value: minVisibleMinute + index, label: `0${minVisibleMinute + index}`.slice(-2) }
      })
    },
    isMinuteOverflow(minVisibleMinute) {
      return minVisibleMinute >= 60;
    },
    isHourOverflow(minHour) {
      return minHour >= 24
    },
    handleMinuteOverflow(minVisibleMinute) {
      this.changeMinuteOptions(minVisibleMinute - MIN_DELAY_MINUTE - 60);
      this.updateMinute();

      this.hour = this.hour + 1;
      if (this.isHourOverflow(this.hour)) {
        this.handleHourOverflow();
      } else {
        this.hourOptions = this.hourOptions.slice(1);
      }
    },
    handleHourOverflow() {
      this.initHourOptions();
      this.hour = this.hourOptions[0].value;

      this.changeDateOptions();
      this.date = this.dateOptions[0].value;
    },
    initDateOptions() {
      let currentDate = new Date();
      let day1 = formatDate(currentDate, 'yyyy-MM-dd');
      let day2 = formatDate(currentDate.getTime() + 3600 * 1000 * 24, 'yyyy-MM-dd');
      let day3 = formatDate(currentDate.getTime() + 3600 * 1000 * 48, 'yyyy-MM-dd');
      let day1Label = `今天  （${day1}）`;
      let day2Label = `明天  （${day2}）`;
      let day3Label = `后天  （${day3}）`;
      this.dateOptions = [{ value: day1, label: day1Label },
        { value: day2, label: day2Label },
        { value: day3, label: day3Label }];

      let isMinuteOverflow = this.isMinuteOverflow(currentDate.getMinutes());
      let isHourOverflow = this.isHourOverflow(currentDate.getHours());
      if ( isMinuteOverflow && isHourOverflow) this.dateOptions = this.dateOptions.slice(1);
    },
    initHourOptions() {
      this.hourOptions = new Array(24).fill(0).map((item, index) => {
        return { value: index, label: `0${index}`.slice(-2) }
      });
    },
    initMinuteOptions() {
      this.minuteOptions = new Array(60).fill(0).map((item, index) => {
        return { value: index, label: `0${index}`.slice(-2) }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
 .dingtime {
    display: flex;
    margin-bottom: 150px;
    .date-picker {
      width: 220px;
    }
    .hour-picker {
      width: 150px;
      padding-left: 15px;
      padding-right: 5px;
    }
    .minute-picker {
      width: 150px;
      padding-left: 10px;
      padding-right: 5px;
    }
  }
</style>

