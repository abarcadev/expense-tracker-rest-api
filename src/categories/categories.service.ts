import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FindAllCategoriesDto } from './dto/find-all-categories.dto';
import { ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const { id } = await this.categoryModel.create(createCategoryDto);
      return { id };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(ERROR_MESSAGES.REGISTER_NOT_SAVED);
    }
  }

  async findAll(findAllCategoriesDto: FindAllCategoriesDto) {
    const {
      name,
      description,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = findAllCategoriesDto;

    const query = {
      ...(name && { name: { $regex: name, $options: 'i' } }),
      ...(description && {
        description: { $regex: description, $options: 'i' },
      }),
      ...(startDate &&
        endDate && {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        }),
    };

    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      { $match: query },
      {
        $project: {
          name: 1,
          description: 1,
        },
      },
      {
        $sort: {
          name: 1,
          _id: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    const [data, total] = await Promise.all([
      this.categoryModel.aggregate(pipeline),
      this.categoryModel.countDocuments(query),
    ]);

    return {
      data,
      total,
    };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findOne(
      { _id: id },
      'name description',
    );

    if (!category) {
      throw new NotFoundException(
        ERROR_MESSAGES.REGISTER_NOT_FOUND('category', id),
      );
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    try {
      await this.categoryModel.updateOne({ _id: id }, updateCategoryDto);
      return { id };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(ERROR_MESSAGES.REGISTER_NOT_SAVED);
    }
  }
}
