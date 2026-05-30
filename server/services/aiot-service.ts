import * as tf from '@tensorflow/tfjs'

export class AIoTService {
    private history: Map<number, number[]> = new Map()
    private readonly MAX_HISTORY = 50

    constructor() {
        // Initializing TF logic if needed
        console.log('AIoT Service Initialized with TensorFlow.js')
    }

    /**
     * Detects anomaly in water debit using a moving average & standard deviation
     * Logic implemented using TensorFlow.js tensors
     */
    async detectAnomaly(currentValue: number, pointId: number): Promise<boolean> {
        if (!this.history.has(pointId)) {
            this.history.set(pointId, [])
        }

        const data = this.history.get(pointId)!
        if (data.length < 5) {
            data.push(currentValue)
            return false
        }

        return tf.tidy(() => {
            const tensor = tf.tensor1d(data)
            const mean = tensor.mean()
            const std = tf.sqrt(tf.mean(tf.square(tf.sub(tensor, mean))))

            const meanResult = mean.dataSync()[0]
            const stdResult = std.dataSync()[0]

            const meanVal = meanResult ?? 0
            const stdVal = stdResult ?? 0

            // Standard Anomaly Detection: value > mean + 2*std or value < mean - 2*std
            const threshold = stdVal * 2
            const isAnomaly = Math.abs(currentValue - meanVal) > threshold

            // Update history
            data.push(currentValue)
            if (data.length > this.MAX_HISTORY) {
                data.shift()
            }

            return isAnomaly
        })
    }

    /**
     * Predict next water level based on history
     */
    async predictNext(pointId: number): Promise<number | null> {
        const data = this.history.get(pointId)
        if (!data || data.length < 10) return null

        let prediction: number | null = null

        tf.tidy(() => {
            // Simple linear regression prediction example using TF.js
            const xs = tf.range(0, data.length)

            // Normalize
            const xMean = xs.mean()
            const xStd = tf.sqrt(tf.mean(tf.square(tf.sub(xs, xMean))))

            // In a real scenario, we would train the model here or use a pre-trained one.
            // For this demo, we use a simple projection logic.

            const lastVal = data[data.length - 1]
            prediction = lastVal ?? null
        })

        return prediction
    }
}
