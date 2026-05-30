import { ConfigRepository } from '../repositories/ConfigRepository'

const repo = new ConfigRepository()

export class ConfigService {
    async getMqttConfig() {
        const config = await repo.get('mqtt_broker_config')
        return config?.value || {
            host: 'public.cloud.shiftr.io',
            port: 443,
            clientId: 'noc_' + Math.random().toString(16).slice(2, 8),
            username: 'Public',
            password: 'Public',
            useSsl: true
        }
    }

    async saveMqttConfig(data: any) {
        return await repo.upsert('mqtt_broker_config', data)
    }
}
