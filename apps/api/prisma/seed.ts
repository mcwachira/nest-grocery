/**
 * prisma/seed.ts
 *
 * Seeds the database with a realistic dataset: an admin user, a few
 * customers with addresses, a category tree, products with images,
 * and a handful of orders (in different statuses) with order items.
 *
 * Run with:  npx prisma db seed
 * (requires the "prisma.seed" entry in package.json — see bottom of this file)
 *
 * ---------------------------------------------------------------------------
 * IMPORTANT — Prisma 7 driver adapter
 * ---------------------------------------------------------------------------
 * Your datasource block has no `url = env("DATABASE_URL")` (removed in
 * Prisma 7), so PrismaClient must be constructed with a driver adapter —
 * the same way your src/prisma/prisma.service.ts does it. This script uses
 * @prisma/adapter-pg + a `pg` Pool reading DATABASE_URL. If your
 * prisma.service.ts uses a different adapter (Neon, PlanetScale, libSQL,
 * etc.), swap the import/setup below to match it exactly — otherwise this
 * script will connect via a different driver than your app does.
 *
 *   npm install pg @prisma/adapter-pg
 *   npm install -D @types/pg
 * ---------------------------------------------------------------------------
 */

import {
  PrismaClient,
  Prisma,
  Role,
  ProductStatus,
  OrderStatus,
  PaymentProvider,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set — cannot seed the database.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const CATEGORY_TREE: {
  name: string;
  description: string;
  children?: { name: string; description: string }[];
}[] = [
  {
    name: 'Vegetables',
    description: 'Fresh, locally grown vegetables.',
    children: [
      {
        name: 'Leafy Greens',
        description: 'Sukuma wiki, spinach, managu and more.',
      },
      {
        name: 'Root Vegetables',
        description: 'Potatoes, carrots, onions and more.',
      },
    ],
  },
  {
    name: 'Fruits',
    description: 'Seasonal and everyday fruit.',
    children: [
      {
        name: 'Tropical Fruits',
        description: 'Mangoes, pineapples, passion fruit.',
      },
    ],
  },
  {
    name: 'Dairy & Eggs',
    description: 'Milk, yoghurt, cheese and eggs.',
  },
  {
    name: 'Grains & Cereals',
    description: 'Maize, rice, beans and flours.',
  },
  {
    name: 'Herbs & Spices',
    description: 'Fresh herbs and dried spices.',
  },
];

type ProductSeed = {
  name: string;
  description: string;
  priceCents: number;
  compareAtPriceCents?: number;
  unit: string;
  stock: number;
  isOrganic?: boolean;
  sku: string;
  imageUrl: string;
};

const PRODUCTS_BY_CATEGORY: Record<string, ProductSeed[]> = {
  'Leafy Greens': [
    {
      name: 'Sukuma Wiki (Collard Greens)',
      description: 'Freshly harvested sukuma wiki, sold by the bunch.',
      priceCents: 5000,
       unit: 'bunch',
      stock: 120,
      isOrganic: true,
      sku: 'VEG-SUKUMA-001',
      imageUrl: 'https://images.example.com/products/sukuma-wiki.jpg',
    },
    {
      name: 'Managu (African Nightshade)',
      description: 'Traditional leafy green, rich in iron.',
      priceCents: 7000,
      unit: 'bunch',
      stock: 60,
      isOrganic: true,
      sku: 'VEG-MANAGU-001',
      imageUrl: 'https://images.example.com/products/managu.jpg',
    },
    {
      name: 'Baby Spinach',
      description: 'Tender baby spinach leaves, washed and ready to cook.',
      priceCents: 12000,
      compareAtPriceCents: 15000,
      unit: '250g pack',
      stock: 45,
      sku: 'VEG-SPINACH-001',
      imageUrl: 'https://images.example.com/products/spinach.jpg',
    },
  ],
  'Root Vegetables': [
    {
      name: 'Irish Potatoes',
      description: 'Farm-fresh potatoes, great for chips or mashing.',
      priceCents: 15000,
      unit: '2kg bag',
      stock: 200,
      sku: 'VEG-POTATO-001',
      imageUrl: 'https://images.example.com/products/potatoes.jpg',
    },
    {
      name: 'Carrots',
      description: 'Crisp, sweet carrots.',
      priceCents: 9000,
      unit: '1kg bag',
      stock: 150,
      sku: 'VEG-CARROT-001',
      imageUrl: 'https://images.example.com/products/carrots.jpg',
    },
    {
      name: 'Red Onions',
      description: 'Locally grown red onions.',
      priceCents: 11000,
      unit: '1kg bag',
      stock: 180,
      sku: 'VEG-ONION-001',
      imageUrl: 'https://images.example.com/products/onions.jpg',
    },
  ],
  'Tropical Fruits': [
    {
      name: 'Ngowe Mangoes',
      description: 'Sweet, fibreless mangoes from the coast.',
      priceCents: 20000,
      unit: '1kg',
      stock: 90,
      isOrganic: true,
      sku: 'FRT-MANGO-001',
      imageUrl: 'https://images.example.com/products/mangoes.jpg',
    },
    {
      name: 'Pineapple',
      description: 'Whole ripe pineapple.',
      priceCents: 18000,
      unit: 'each',
      stock: 70,
      sku: 'FRT-PINEAPPLE-001',
      imageUrl: 'https://images.example.com/products/pineapple.jpg',
    },
    {
      name: 'Passion Fruit',
      description: 'Tangy passion fruit, sold by the punnet.',
      priceCents: 25000,
      unit: '500g punnet',
      stock: 40,
      sku: 'FRT-PASSION-001',
      imageUrl: 'https://images.example.com/products/passion-fruit.jpg',
    },
  ],
  'Dairy & Eggs': [
    {
      name: 'Fresh Whole Milk',
      description: 'Pasteurised whole milk from local dairies.',
      priceCents: 8000,
      unit: '1L',
      stock: 100,
      sku: 'DRY-MILK-001',
      imageUrl: 'https://images.example.com/products/milk.jpg',
    },
    {
      name: 'Free-Range Eggs',
      description: 'Tray of 30 free-range eggs.',
      priceCents: 45000,
      compareAtPriceCents: 50000,
      unit: 'tray of 30',
      stock: 55,
      sku: 'DRY-EGGS-001',
      imageUrl: 'https://images.example.com/products/eggs.jpg',
    },
  ],
  'Grains & Cereals': [
    {
      name: 'Dry Maize',
      description: 'Whole dry maize grain.',
      priceCents: 30000,
      unit: '5kg bag',
      stock: 80,
      sku: 'GRN-MAIZE-001',
      imageUrl: 'https://images.example.com/products/maize.jpg',
    },
    {
      name: 'Pishori Rice',
      description: 'Aromatic Mwea pishori rice.',
      priceCents: 65000,
      unit: '5kg bag',
      stock: 60,
      sku: 'GRN-RICE-001',
      imageUrl: 'https://images.example.com/products/rice.jpg',
    },
  ],
  'Herbs & Spices': [
    {
      name: 'Fresh Coriander (Dhania)',
      description: 'Fresh coriander, sold in bunches.',
      priceCents: 3000,
      unit: 'bunch',
      stock: 100,
      sku: 'HRB-DHANIA-001',
      imageUrl: 'https://images.example.com/products/coriander.jpg',
    },
    {
      name: 'Dried Chilli Powder',
      description: 'Ground dried chilli, medium heat.',
      priceCents: 15000,
      unit: '200g jar',
      stock: 50,
      sku: 'HRB-CHILLI-001',
      imageUrl: 'https://images.example.com/products/chilli-powder.jpg',
    },
  ],
};

// ---------------------------------------------------------------------------
// Seed steps
// ---------------------------------------------------------------------------

async function cleanup() {
  // Delete in FK-dependency order so this script is safely re-runnable.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  const adminPasswordHash = await hash('Admin@12345');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      firstName: 'Amina',
      lastName: 'Otieno',
      phone: '+254700000001',
      role: Role.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  const customerSeeds = [
    {
      email: 'jane.mwangi@example.com',
      firstName: 'Jane',
      lastName: 'Mwangi',
      phone: '+254700000002',
      address: {
        label: 'Home',
        line1: 'Riverside Drive, House 12',
        city: 'Nairobi',
        region: 'Nairobi County',
        postalCode: '00100',
      },
    },
    {
      email: 'brian.otieno@example.com',
      firstName: 'Brian',
      lastName: 'Otieno',
      phone: '+254700000003',
      address: {
        label: 'Home',
        line1: 'Diani Beach Road',
        city: 'Ukunda',
        region: 'Kwale County',
        postalCode: '80400',
      },
    },
    {
      email: 'fatuma.hassan@example.com',
      firstName: 'Fatuma',
      lastName: 'Hassan',
      phone: '+254700000004',
      address: {
        label: 'Office',
        line1: 'Moi Avenue, 3rd Floor',
        city: 'Mombasa',
        region: 'Mombasa County',
        postalCode: '80100',
      },
    },
  ];

  // Explicit type needed here — otherwise TS infers `never[]` from the
  // empty array literal, and every later `customers.push(...)` /
  // `customer.address` / `customer.id` access fails to compile.
  const customers: Prisma.UserGetPayload<{ include: { address: true } }>[] =
    [];
  for (const c of customerSeeds) {
    const passwordHash = await hash('Customer@12345');
    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        role: Role.CUSTOMER,
        emailVerifiedAt: new Date(),
        address: {
          create: {
            label: c.address.label,
            line1: c.address.line1,
            city: c.address.city,
            region: c.address.region,
            postalCode: c.address.postalCode,
            country: 'KE',
            isDefault: true,
          },
        },
      },
      include: { address: true },
    });
    customers.push(user);
  }

  return { admin, customers };
}

async function seedCategories() {
  // Map of category name -> created Category record (for product linking).
  const categoryByName = new Map<
    string,
    Awaited<ReturnType<typeof prisma.category.create>>
  >();

  let sortOrder = 0;
  for (const top of CATEGORY_TREE) {
    const parent = await prisma.category.create({
      data: {
        name: top.name,
        slug: slugify(top.name),
        description: top.description,
        sortOrder: sortOrder++,
      },
    });
    categoryByName.set(top.name, parent);

    if (top.children) {
      let childSort = 0;
      for (const child of top.children) {
        const created = await prisma.category.create({
          data: {
            name: child.name,
            slug: slugify(child.name),
            description: child.description,
            parentId: parent.id,
            sortOrder: childSort++,
          },
        });
        categoryByName.set(child.name, created);
      }
    }
  }

  return categoryByName;
}

async function seedProducts(categoryByName: Map<string, { id: string }>) {
  const createdProducts: { id: string; name: string; priceCents: number }[] =
    [];

  for (const [categoryName, products] of Object.entries(PRODUCTS_BY_CATEGORY)) {
    const category = categoryByName.get(categoryName);
    if (!category) continue;

    for (const p of products) {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          slug: slugify(p.name),
          description: p.description,
          priceCents: p.priceCents,
          compareAtPriceCents: p.compareAtPriceCents,
          unit: p.unit,
          stock: p.stock,
          sku: p.sku,
          isOrganic: p.isOrganic ?? false,
          status: ProductStatus.ACTIVE,
          categoryId: category.id,
          images: {
            create: [{ url: p.imageUrl, altText: p.name, sortOrder: 0 }],
          },
        },
      });
      createdProducts.push({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
      });
    }
  }

  // One extra DRAFT product so status filtering has something to exclude.
  const anyCategory = [...categoryByName.values()][0];
  await prisma.product.create({
    data: {
      name: 'Unreleased Seasonal Basket',
      slug: 'unreleased-seasonal-basket',
      description: 'Not yet published — used to test draft/status filtering.',
      priceCents: 100000,
      unit: 'basket',
      stock: 0,
      status: ProductStatus.DRAFT,
      categoryId: anyCategory.id,
    },
  });

  return createdProducts;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedOrders(
  customers: Awaited<ReturnType<typeof seedUsers>>['customers'],
  products: { id: string; name: string; priceCents: number }[],
) {
  const DELIVERY_FEE_CENTS = 20000;

  const orderPlans: { status: OrderStatus; provider: PaymentProvider }[] = [
    { status: OrderStatus.DELIVERED, provider: PaymentProvider.MPESA },
    { status: OrderStatus.PAID, provider: PaymentProvider.CARD },
    { status: OrderStatus.PENDING_PAYMENT, provider: PaymentProvider.MPESA },
  ];

  for (const customer of customers) {
    const address = customer.address[0];

    for (const [i, plan] of orderPlans.entries()) {
      // 2-3 random line items per order.
      const itemCount = 2 + Math.floor(Math.random() * 2);
      const chosenProducts = Array.from({ length: itemCount }, () =>
        pick(products),
      );

      const items = chosenProducts.map((prod) => {
        const quantity = 1 + Math.floor(Math.random() * 3);
        const subtotalCents = prod.priceCents * quantity;
        return {
          productId: prod.id,
          productName: prod.name,
          unitPriceCents: prod.priceCents,
          quantity,
          subtotalCents,
        };
      });

      const itemsTotalCents = items.reduce(
        (sum, it) => sum + it.subtotalCents,
        0,
      );
      const totalCents = itemsTotalCents + DELIVERY_FEE_CENTS;

      const now = new Date();
      const placedAt = new Date(
        now.getTime() - (i + 1) * 3 * 24 * 60 * 60 * 1000,
      ); // stagger dates

      const isPaid = plan.status !== OrderStatus.PENDING_PAYMENT;
      // Explicit OrderStatus[] type — otherwise TS narrows the array
      // literal to a 3-member literal union that .includes(plan.status)
      // (typed as the full OrderStatus enum) can't be checked against.
      const fulfilledStatuses: OrderStatus[] = [
        OrderStatus.FULFILLED,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
      ];
      const isFulfilled = fulfilledStatuses.includes(plan.status);
      const isDelivered = plan.status === OrderStatus.DELIVERED;

      await prisma.order.create({
        data: {
          userId: customer.id,
          status: plan.status,
          totalCents,
          deliveryFeeCents: DELIVERY_FEE_CENTS,
          shippingLine1: address.line1,
          shippingLine2: address.line2,
          shippingCity: address.city,
          shippingRegion: address.region,
          shippingPostalCode: address.postalCode,
          shippingCountry: address.country,
          paymentProvider: plan.provider,
          paymentReference: isPaid
            ? `${plan.provider}-${customer.id.slice(0, 8)}-${i}`
            : null,
          placedAt,
          paidAt: isPaid ? placedAt : null,
          fulfilledAt: isFulfilled ? placedAt : null,
          deliveredAt: isDelivered ? placedAt : null,
          items: { create: items },
        },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  console.log('Cleaning up existing data...');
  await cleanup();

  console.log('Seeding users and addresses...');
  const { admin, customers } = await seedUsers();
  console.log(
    `  created admin (${admin.email}) and ${customers.length} customers`,
  );

  console.log('Seeding categories...');
  const categoryByName = await seedCategories();
  console.log(`  created ${categoryByName.size} categories`);

  console.log('Seeding products...');
  const products = await seedProducts(categoryByName);
  console.log(`  created ${products.length} active products`);

  console.log('Seeding orders...');
  await seedOrders(customers, products);
  console.log('  done');

  console.log('\nSeed complete.');
  console.log('Login credentials:');
  console.log('  admin:    admin@example.com / Admin@12345');
  console.log(
    '  customer: jane.mwangi@example.com / Customer@12345 (same password for all customers)',
  );
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

/**
 * ---------------------------------------------------------------------------
 * package.json wiring — already done (see "prisma.seed" in package.json,
 * using `tsx` — already a devDependency here — rather than ts-node, since
 * tsx needs no extra compiler-options flag to run a plain CommonJS-ish
 * script under this project's `"module": "nodenext"` tsconfig).
 * ---------------------------------------------------------------------------
 */
