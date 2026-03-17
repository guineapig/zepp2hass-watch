import './shared/device-polyfill'
import { set as setAlarm } from '@zos/alarm'
import { localStorage } from '@zos/storage'

App({
  globalData: {},
  onCreate(options) {
    console.log('zepp2hass app created')

    // Schedule first sync if no alarm is set yet
    const existingAlarm = localStorage.getItem('alarm_id')
    if (!existingAlarm) {
      const id = setAlarm({
        url: 'app-service/sync',
        delay: 10,
        store: true,
      })
      if (id !== 0) {
        localStorage.setItem('alarm_id', id)
      }
    }
  },
  onDestroy(options) {
    console.log('zepp2hass app destroyed')
  },
})
