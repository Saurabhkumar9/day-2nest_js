// src/product/product.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  //  Create new product (Protected)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User,
  ) {
    return this.productService.create(createProductDto, user);
  }

  //  Get all products (Public)
  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.productService.findAll(userId);
  }

  //  Get single product (Public)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id);
  }

  //  Update product (Protected - Owner only)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productService.update(id, updateProductDto, user);
  }

  //  Delete product (Protected - Owner only)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.productService.remove(id, user);
  }

  //  Get my products (Protected)
  @Get('me/my-products')
  @UseGuards(JwtAuthGuard)
  findMyProducts(@GetUser() user: User) {
    return this.productService.findByUser(user.id);
  }

  //  Toggle product active status (Protected - Owner only)
  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.productService.toggleActive(id, user);
  }
}