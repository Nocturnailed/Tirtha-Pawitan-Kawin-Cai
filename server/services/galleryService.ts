import { GalleryRepository } from '../repositories/GalleryRepository'

const repo = new GalleryRepository()

export class GalleryService {
    async getAll() {
        return repo.findAll()
    }

    async getById(id: number) {
        return repo.findById(id)
    }

    async create(data: { title: string; image_url: string; caption?: string; is_featured?: boolean; sort_order?: number }) {
        return repo.create(data)
    }

    async update(id: number, data: any) {
        return repo.update(id, data)
    }

    async delete(id: number) {
        return repo.delete(id)
    }
}
