import { createWidget, widget, prop, align, text_style } from '@zos/ui'
import { px } from '@zos/utils'
import { localStorage } from '@zos/storage'
import { start } from '@zos/app-service'
import * as Styles from 'zosLoader:./index.[pf].layout.js'

Page({
  state: {
    statusWidget: null,
    infoWidget: null,
  },

  build() {
    // Title
    createWidget(widget.TEXT, {
      ...Styles.TITLE_STYLE,
      text: 'zepp2hass',
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    })

    // Status line — read from localStorage (written by sync service)
    const lastSync = localStorage.getItem('last_sync') || 'Never'
    const lastStatus = localStorage.getItem('last_sync_status') || 'Not synced yet'

    let statusText = 'Last sync: ' + lastSync
    if (lastSync !== 'Never') {
      try {
        const d = new Date(lastSync)
        statusText = 'Last sync: ' +
          String(d.getHours()).padStart(2, '0') + ':' +
          String(d.getMinutes()).padStart(2, '0')
      } catch (e) {}
    }

    this.state.statusWidget = createWidget(widget.TEXT, {
      ...Styles.STATUS_STYLE,
      text: statusText,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
    })

    // Info line
    this.state.infoWidget = createWidget(widget.TEXT, {
      ...Styles.INFO_STYLE,
      text: 'Status: ' + lastStatus,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
    })

    // Sync now button — triggers the background service
    createWidget(widget.BUTTON, {
      ...Styles.SYNC_BUTTON_STYLE,
      click_func: () => {
        this.triggerSync()
      },
    })
  },

  triggerSync() {
    this.state.statusWidget.setProperty(prop.TEXT, 'Sync started...')
    this.state.infoWidget.setProperty(prop.TEXT, 'Running in background')

    start({
      file: 'app-service/sync',
      param: 'manual',
    })

    // Poll localStorage for the result after a few seconds
    setTimeout(() => {
      const status = localStorage.getItem('last_sync_status') || ''
      const lastSync = localStorage.getItem('last_sync') || ''
      if (lastSync) {
        try {
          const d = new Date(lastSync)
          this.state.statusWidget.setProperty(prop.TEXT,
            'Last sync: ' +
            String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0'))
        } catch (e) {
          this.state.statusWidget.setProperty(prop.TEXT, 'Last sync: ' + lastSync)
        }
      }
      this.state.infoWidget.setProperty(prop.TEXT, 'Status: ' + (status || 'unknown'))
    }, 8000)
  },

  onDestroy() {},
})
