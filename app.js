import './shared/device-polyfill'
import { start } from '@zos/app-service'

App({
  globalData: {},

  onCreate(options) {
    console.log('zepp2hass app created')

    // ZeppOS 4 bg:service: start the service directly instead of using
    // device:os.alarm to relaunch app-service/sync.
    try {
      start({
        file: 'app-service/sync',
        param: 'app_launch',
      })
    } catch (e) {
      console.log('failed to start zepp2hass sync service')
    }
  },

  onDestroy(options) {
    console.log('zepp2hass app destroyed')
  },
})
