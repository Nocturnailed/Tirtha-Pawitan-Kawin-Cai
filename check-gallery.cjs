const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const gallery = await prisma.gallery_items.findMany();
    console.log('Gallery Items:', JSON.stringify(gallery, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
