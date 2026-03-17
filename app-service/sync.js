import '../shared/device-polyfill'
import { MessageBuilder } from '../shared/message'
import { getPackageInfo } from '@zos/app'
import * as ble from '@zos/ble'
import { set as setAlarm, cancel as cancelAlarm } from '@zos/alarm'
import { localStorage } from '@zos/storage'
import {
  HeartRate,
  BloodOxygen,
  Stress,
  Sleep,
  Step,
  Calorie,
  Distance,
  FatBurning,
  Pai,
  Stand,
  Battery,
  Wear,
  BodyTemperature,
  Screen,
  Workout,
} from '@zos/sensor'
import { getDeviceInfo } from '@zos/device'
import { getProfile } from '@zos/user'

function safeCall(fn) {
  try {
    return fn()
  } catch (e) {
    return null
  }
}

function collectSensorData() {
  const hr = safeCall(() => {
    const s = new HeartRate()
    const result = { last: s.getLast() || null, resting: null }
    try { result.resting = s.getResting() || null } catch (e) {}
    try {
      const summary = s.getDailySummary()
      if (summary && summary.maximum) {
        result.summary = { maximum: { hr_value: summary.maximum.hr_value || null } }
      }
    } catch (e) {}
    return result
  })

  const steps = safeCall(() => {
    const s = new Step()
    return { current: s.getCurrent() || 0, target: s.getTarget() || 0 }
  })

  const calorie = safeCall(() => {
    const s = new Calorie()
    return { current: s.getCurrent() || 0, target: s.getTarget() || 0 }
  })

  const distance = safeCall(() => {
    const s = new Distance()
    return { current: s.getCurrent() || 0 }
  })

  const bloodOxygen = safeCall(() => {
    const s = new BloodOxygen()
    const readings = s.getLastFewHour(2)
    if (readings && readings.length > 0) {
      return { few_hours: readings }
    }
    const current = s.getCurrent()
    if (current && current.value) {
      return { few_hours: [{ spo2: current.value, time: current.time }] }
    }
    return null
  })

  const stress = safeCall(() => {
    const s = new Stress()
    const current = s.getCurrent()
    if (current && current.value) {
      return { current: { value: current.value } }
    }
    return null
  })

  const bodyTemp = safeCall(() => {
    const s = new BodyTemperature()
    const current = s.getCurrent()
    if (current && current.current && current.current > 0) {
      return { current: { value: current.current } }
    }
    return null
  })

  const sleep = safeCall(() => {
    const s = new Sleep()
    s.updateInfo()
    const info = s.getInfo()
    const status = s.getSleepingStatus()
    const result = { status: status != null ? status : 0 }
    if (info) {
      result.info = {
        score: info.score || 0,
        startTime: info.startTime || 0,
        endTime: info.endTime || 0,
        deepTime: info.deepTime || 0,
        totalTime: info.totalTime || 0,
      }
    }
    return result
  })

  const pai = safeCall(() => {
    const s = new Pai()
    return { week: s.getTotal() || 0, day: s.getToday() || 0 }
  })

  const fatBurning = safeCall(() => {
    const s = new FatBurning()
    return { current: s.getCurrent() || 0, target: s.getTarget() || 0 }
  })

  const stands = safeCall(() => {
    const s = new Stand()
    return { current: s.getCurrent() || 0, target: s.getTarget() || 0 }
  })

  const battery = safeCall(() => {
    const s = new Battery()
    return { current: s.getCurrent() || 0 }
  })

  const wearStatus = safeCall(() => {
    const s = new Wear()
    return s.getStatus()
  })

  const screen = safeCall(() => {
    const s = new Screen()
    const result = { status: s.getStatus() }
    try { result.aod_mode = s.getAodMode() ? 1 : 0 } catch (e) {}
    try { result.light = s.getLight() } catch (e) {}
    return result
  })

  const workout = safeCall(() => {
    const s = new Workout()
    const result = {}
    try {
      const status = s.getStatus()
      if (status) {
        result.vo2Max = status.vo2Max || null
        result.trainingLoad = status.trainingLoad || null
        result.fullRecoveryTime = status.fullRecoveryTime || null
      }
    } catch (e) {}
    try {
      const history = s.getHistory()
      if (history && history.length > 0) {
        result.count = history.length
        const last = history[history.length - 1]
        result.last = {
          startTime: last.startTime || 0,
          duration: last.duration || 0,
        }
      }
    } catch (e) {}
    return Object.keys(result).length > 0 ? result : null
  })

  const device = safeCall(() => {
    const info = getDeviceInfo()
    if (!info) return null
    return {
      deviceName: info.deviceName || null,
      deviceSource: info.deviceSource || null,
      width: info.width || null,
      height: info.height || null,
    }
  })

  const user = safeCall(() => {
    const profile = getProfile()
    if (!profile) return null
    return {
      age: profile.age || null,
      height: profile.height || null,
      weight: profile.weight || null,
      gender: profile.gender != null ? profile.gender : null,
      nickName: profile.nickName || null,
    }
  })

  const payload = {
    record_time: new Date().toISOString(),
    battery,
    steps,
    calorie,
    distance,
    heart_rate: hr,
    blood_oxygen: bloodOxygen,
    stress,
    body_temperature: bodyTemp,
    sleep,
    pai,
    fat_burning: fatBurning,
    stands,
    is_wearing: wearStatus,
    screen,
    workout,
    device,
    user,
  }

  for (const key in payload) {
    if (payload[key] === null || payload[key] === undefined) {
      delete payload[key]
    }
  }

  return payload
}

function scheduleNextSync(delaySec) {
  const prevId = localStorage.getItem('alarm_id')
  if (prevId) {
    try { cancelAlarm(prevId) } catch (e) {}
  }

  const id = setAlarm({
    url: 'app-service/sync',
    delay: delaySec,
    store: true,
  })

  if (id !== 0) {
    localStorage.setItem('alarm_id', id)
  }
}

AppService({
  onInit(e) {
    console.log('zepp2hass sync service started')

    const { appId } = getPackageInfo()
    const messageBuilder = new MessageBuilder({
      appId,
      appDevicePort: 20,
      appSidePort: 0,
      ble,
    })
    messageBuilder.connect()

    const payload = collectSensorData()

    messageBuilder
      .request(
        {
          method: 'SYNC_DATA',
          params: payload,
        },
        { timeout: 15000 }
      )
      .then((data) => {
        let intervalSec = 5 * 60

        if (data && data.interval && data.interval > 0) {
          intervalSec = data.interval * 60
        }

        if (data && data.ok) {
          localStorage.setItem('last_sync', new Date().toISOString())
          localStorage.setItem('last_sync_status', 'ok')
        } else {
          const err = (data && data.error) || 'unknown'
          localStorage.setItem('last_sync_status', 'error: ' + err)
        }

        scheduleNextSync(intervalSec)
        messageBuilder.disConnect()
      })
      .catch((err) => {
        const msg = err && err.message ? err.message : 'timeout'
        localStorage.setItem('last_sync_status', 'error: ' + msg)
        scheduleNextSync(5 * 60)
        messageBuilder.disConnect()
      })
  },

  onDestroy() {
    console.log('zepp2hass sync service stopped')
  },
})
