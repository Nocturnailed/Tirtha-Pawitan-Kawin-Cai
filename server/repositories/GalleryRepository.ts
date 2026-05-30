import { db } from '../utils/database'

export class GalleryRepository {
    async findAll() {
        return db.gallery_items.findMany({
            orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
        })
    }

    async findById(id: number) {
        return db.gallery_items.findUnique({ where: { id } })
    }

    async create(data: any) {
        return db.gallery_items.create({ data })
    }

    async update(id: number, data: any) {
        return db.gallery_items.update({ where: { id }, data })
    }

    async delete(id: number) {
        return db.gallery_items.delete({ where: { id } })
    }
}
