import { px } from '@zos/utils'

export const DEVICE_WIDTH = px(480)
export const DEVICE_HEIGHT = px(480)

export const TITLE_STYLE = {
  x: px(0),
  y: px(60),
  w: DEVICE_WIDTH,
  h: px(40),
  color: 0xffffff,
  text_size: px(32),
}

export const STATUS_STYLE = {
  x: px(40),
  y: px(120),
  w: DEVICE_WIDTH - px(80),
  h: px(60),
  color: 0xcccccc,
  text_size: px(26),
}

export const INFO_STYLE = {
  x: px(40),
  y: px(200),
  w: DEVICE_WIDTH - px(80),
  h: px(80),
  color: 0x888888,
  text_size: px(22),
}

export const SYNC_BUTTON_STYLE = {
  x: (DEVICE_WIDTH - px(280)) / 2,
  y: px(320),
  w: px(280),
  h: px(80),
  radius: px(40),
  normal_color: 0x1e88e5,
  press_color: 0x1565c0,
  text: 'Sync Now',
  text_size: px(28),
  color: 0xffffff,
}
