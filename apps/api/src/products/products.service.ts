import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryProductDto } from './dto/query-product.dto';
import { Prisma, ProductStatus } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const MAX_LIMIT = 100;
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: QueryProductDto) {
    const limit = Math.min(query.limit ?? 20, MAX_LIMIT);
    const page = Math.max(query.page ?? 1, 1);

    // Build the WHERE clause incrementally instead of one giant nested
    // ternary — each condition is independently readable and the type
    // (Prisma.ProductWhereInput) catches typos against the schema.

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE, // public endpoint- never leaked DRAFT/ARCHIVED products
    };

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.organic !== undefined) {
      where.isOrganic = query.organic;
    }

    if (query.exclude) {
      where.id = { not: query.exclude };
    }

    if (query.search) {
      // ILIKE is fine at this catalog size — see docs/02-products-and-categories.md.
      // mode:'insensitive' is Prisma's ILIKE equivalent for Postgres.
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    // $transaction here isn't for atomicity — it's so both queries run
    // concurrently over the same connection instead of sequentially,
    // and so the total count and the page are consistent with each other
    // (no row could be inserted/deleted between the two calls).

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { images: true, category: true }, // avoid N+1 ISSUES
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
    });
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.assertExists(id);

    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async archive(id: string) {
    await this.assertExists(id);

    // Soft-delete, not prisma.product.delete() — see docs/02-products-and-categories.md.
    // OrderItem.productId still points here even after archiving; a hard
    // delete would either cascade-orphan order history or fail on the FK.
    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });
  }

  private async assertExists(id: string) {
    const found = await this.prisma.product.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Product not found');
  }
}
