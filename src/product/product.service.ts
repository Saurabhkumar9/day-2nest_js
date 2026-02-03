// src/product/product.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  //  Create product with user association
  async create(createProductDto: CreateProductDto, user: User): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      user, // Automatically associate with logged-in user
      userId: user.id,
    });

    return await this.productRepository.save(product);
  }

  // Find all products (with optional user filter)
  async findAll(userId?: string): Promise<Product[]> {
    const where = userId ? { userId } : {};
    
    return await this.productRepository.find({
      where,
      relations: ['user'], // Include user details
      order: { createdAt: 'DESC' },
    });
  }

  //  Find single product
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  // Update product (only owner can update)
  async update(id: string, updateProductDto: UpdateProductDto, user: User): Promise<Product> {
    const product = await this.findOne(id);
    
    // Check if user owns this product
    if (product.userId !== user.id) {
      throw new ForbiddenException('You can only update your own products');
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  // Delete product (only owner can delete)
  async remove(id: string, user: User): Promise<void> {
    const product = await this.findOne(id);
    
    // Check if user owns this product
    if (product.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productRepository.remove(product);
  }

  // Find products by specific user
  async findByUser(userId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  //  Toggle product active status
  async toggleActive(id: string, user: User): Promise<Product> {
    const product = await this.findOne(id);
    
    if (product.userId !== user.id) {
      throw new ForbiddenException('You can only modify your own products');
    }

    product.isActive = !product.isActive;
    return await this.productRepository.save(product);
  }
}