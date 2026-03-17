AppSettingsPage({
  state: {
    props: {},
    webhookUrl: '',
    syncInterval: '5',
  },

  setState(props) {
    this.state.props = props
    const stored = props.settingsStorage

    const urlVal = stored.getItem('webhook_url')
    if (urlVal) {
      try { this.state.webhookUrl = JSON.parse(urlVal) } catch (e) {}
    }

    const intVal = stored.getItem('sync_interval_minutes')
    if (intVal) {
      try { this.state.syncInterval = JSON.parse(intVal) } catch (e) {}
    }
  },

  build(props) {
    this.setState(props)

    const intervals = ['1', '2', '5', '10', '15', '30']
    const intervalLabels = {
      '1': '1 min', '2': '2 min', '5': '5 min',
      '10': '10 min', '15': '15 min', '30': '30 min',
    }

    const intervalButtons = intervals.map((val) => {
      const isActive = this.state.syncInterval === val
      return Button({
        label: intervalLabels[val],
        style: {
          fontSize: '14px',
          padding: '8px 16px',
          margin: '4px',
          borderRadius: '20px',
          border: 'none',
          background: isActive ? '#1e88e5' : '#e0e0e0',
          color: isActive ? 'white' : '#333',
        },
        onClick: () => {
          this.state.syncInterval = val
          this.state.props.settingsStorage.setItem(
            'sync_interval_minutes',
            JSON.stringify(val)
          )
        },
      })
    })

    return View(
      {
        style: {
          padding: '20px',
          fontFamily: 'sans-serif',
        },
      },
      [
        // Title
        View(
          {
            style: {
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#1e88e5',
            },
          },
          ['zepp2hass Settings']
        ),

        // Webhook URL section
        View(
          {
            style: {
              marginBottom: '24px',
            },
          },
          [
            View(
              {
                style: {
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#333',
                },
              },
              ['Home Assistant Webhook URL']
            ),
            View(
              {
                style: {
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '8px',
                },
              },
              ['Full URL from the zepp2hass integration page']
            ),
            TextInput({
              label: 'Webhook URL',
              placeholder: 'https://your-ha.com/api/webhook/...',
              value: this.state.webhookUrl,
              onChange: (val) => {
                this.state.webhookUrl = val
                this.state.props.settingsStorage.setItem(
                  'webhook_url',
                  JSON.stringify(val)
                )
              },
            }),
          ]
        ),

        // Sync interval section
        View(
          {
            style: {
              marginBottom: '24px',
            },
          },
          [
            View(
              {
                style: {
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#333',
                },
              },
              ['Sync Interval']
            ),
            View(
              {
                style: {
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '12px',
                },
              },
              ['How often to send health data to Home Assistant']
            ),
            View(
              {
                style: {
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                },
              },
              intervalButtons
            ),
          ]
        ),

        // Status
        View(
          {
            style: {
              marginTop: '16px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666',
            },
          },
          [
            this.state.webhookUrl
              ? 'Webhook: ' + this.state.webhookUrl.substring(0, 50) + (this.state.webhookUrl.length > 50 ? '...' : '')
              : 'No webhook URL configured',
            View({ style: { marginTop: '4px' } }, [
              'Interval: every ' + intervalLabels[this.state.syncInterval],
            ]),
          ]
        ),
      ]
    )
  },
})
