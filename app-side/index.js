import { MessageBuilder } from '../shared/message-side'

const messageBuilder = new MessageBuilder()

function getWebhookUrl() {
  try {
    const raw = settings.settingsStorage.getItem('webhook_url')
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return null
}

function getSyncIntervalMinutes() {
  try {
    const raw = settings.settingsStorage.getItem('sync_interval_minutes')
    if (raw) {
      const val = parseInt(JSON.parse(raw), 10)
      if (val > 0) return val
    }
  } catch (e) {}
  return 5
}

async function postToHA(ctx, payload) {
  const webhookUrl = getWebhookUrl()

  if (!webhookUrl) {
    ctx.response({ data: { ok: false, error: 'no_url' } })
    return
  }

  try {
    const res = await fetch({
      url: webhookUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const resBody = typeof res.body === 'string' ? JSON.parse(res.body) : res.body

    const intervalMin = getSyncIntervalMinutes()
    if (resBody && resBody.status === 'ok') {
      ctx.response({ data: { ok: true, interval: intervalMin } })
    } else {
      ctx.response({ data: { ok: false, error: 'bad_response', interval: intervalMin } })
    }
  } catch (error) {
    const msg = error && error.message ? error.message : 'network_error'
    ctx.response({ data: { ok: false, error: msg } })
  }
}

AppSideService({
  onInit() {
    messageBuilder.listen(() => {})

    messageBuilder.on('request', (ctx) => {
      const jsonRpc = messageBuilder.buf2Json(ctx.request.payload)

      if (jsonRpc.method === 'SYNC_DATA') {
        return postToHA(ctx, jsonRpc.params)
      }

      ctx.response({ data: { ok: false, error: 'unknown_method' } })
    })
  },

  onRun() {},

  onDestroy() {},
})
