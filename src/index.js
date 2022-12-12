import { connect } from 'mqtt'

function uInt8ToJSON(val) {
    var str = ''
    var result
    for (var i = 0; i < val.length; i++) {
        str += String.fromCharCode(val[i])
    }
    try {
        result = JSON.parse(str)
    } catch (e) {
        return null
    }
    return result
}

export const MqttController = {
    Client: function (name, locationName) {
        this.name = name
        this.locationName = locationName


        this.connect = function (url, options, success, error, initialSubscription, initialSubscriptionMessageHandler) {
            this.client = connect(url, options)

            this.callbacks[initialSubscription] = initialSubscriptionMessageHandler

            this.client.on('connect', (connack) => {
                // console.log(connack)
                Object.keys(this.callbacks).forEach((key) => {
                    this.client.unsubscribe(key)
                    this.client.subscribe(key)
                })
                success()
            })

            // error
            this.client.on('close', (e) => {
                console.log('sporstcaster closed')
            })
            this.client.on('offline', (e) => {
                this.error(error, 'offline', e)
            })
            this.client.on('disconnect', (e) => this.error(error, 'disconnect', e))
            this.client.on('error', (e) => this.error(error, 'error', e))
            this.client.on('message', this.handleMessage.bind(this))
            // this.client.on('packetreceive', (packet) => {
            //   if (packet.cmd === 'pingresp') {
            //     console.log(name, ': ', packet)
            //   }

            // })
            // this.client.on('packetsent', (packet) => {
            //   console.log(name, ': ', packet)

            // })

        }

        this.handleMessage = function (topic, message) {
            if (message.length > 0) {
                let temp = uInt8ToJSON(message)
                for (let key in this.callbacks) {
                    if (key === topic) {
                        let callback = this.callbacks[key]
                        callback(temp, topic)
                    }
                }
            }
        }

        this.callbacks = {}

        this.subscribe = function (topic, callback) {
            console.log('subscribing: ', topic)
            this.client.subscribe(topic)

            this.callbacks[topic] = callback
        }

        this.unsubscribe = function (topic) {
            // console.log('unsubscribing: ', topic)
            delete this.callbacks[topic]
            this.client.unsubscribe(topic)
        }

        this.endClient = function () {
            console.log('ending client')
            this.client.end()
        }

        this.error = function (error, type) {
            console.log(type)
            error()
        }
    }
}
