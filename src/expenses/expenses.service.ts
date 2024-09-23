import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Expense } from './schemas/expense.schema';
import { Model, PipelineStage } from 'mongoose';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { FindAllExpensesDto } from './dto/find-all-expenses.dto';
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';
import { ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    @InjectModel(Expense.name)
    private expenseModel: Model<Expense>,

    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto) {
    await this.categoriesService.findOne(createExpenseDto.categoryId);
    await this.usersService.findOne(createExpenseDto.userId);

    try {
      const { id } = await this.expenseModel.create(createExpenseDto);
      return { id };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(ERROR_MESSAGES.REGISTER_NOT_SAVED);
    }
  }

  async findAll(findAllExpensesDto: FindAllExpensesDto) {
    const {
      category,
      username,
      groupByCategory,
      groupByUsername,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = findAllExpensesDto;

    const stages = [
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $unwind: '$categoryInfo',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $match: {
          ...(category && { 'categoryInfo.name': category }),
          ...(username && { 'userInfo.username': username }),
          ...(startDate &&
            endDate && {
              date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            }),
        },
      },
    ];

    const pipeline: PipelineStage[] = [...stages];

    if (groupByCategory || groupByUsername) {
      pipeline.push(
        {
          $group: {
            _id: {
              ...(groupByCategory && { category: '$categoryId' }),
              ...(groupByUsername && { username: '$userId' }),
            },
            totalAmount: {
              $sum: '$amount',
            },
            ...(groupByCategory && {
              category: { $first: '$categoryInfo.name' },
            }),
            ...(groupByUsername && {
              username: { $first: '$userInfo.username' },
            }),
          },
        },
        {
          $project: {
            _id: 0,
            ...(groupByCategory && { category: 1 }),
            ...(groupByUsername && { username: 1 }),
            totalAmount: 1,
          },
        },
        {
          $sort: {
            totalAmount: -1,
          },
        },
      );

      const data = await this.expenseModel.aggregate(pipeline);
      return { data };
    } else {
      pipeline.push({ $count: 'total' });
      const totalDocuments = await this.expenseModel.aggregate(pipeline);
      const total = totalDocuments.length > 0 ? totalDocuments[0].total : 0;

      pipeline.pop();
      pipeline.push(
        {
          $project: {
            date: 1,
            amount: 1,
            description: 1,
            category: '$categoryInfo.name',
            user: '$userInfo.username',
          },
        },
        {
          $sort: {
            date: 1,
            _id: 1,
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      );

      const data = await this.expenseModel.aggregate(pipeline);
      return { data, total };
    }
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseModel
      .findOne({ _id: id }, 'amount date description')
      .populate('categoryId', 'name description')
      .populate('userId', 'name lastName username email');

    if (!expense) {
      throw new NotFoundException(
        ERROR_MESSAGES.REGISTER_NOT_FOUND('expense', id),
      );
    }

    return expense;
  }

  async remove(id: string) {
    const { deletedCount } = await this.expenseModel.deleteOne({ _id: id });

    if (deletedCount === 0) {
      throw new NotFoundException(
        ERROR_MESSAGES.REGISTER_NOT_FOUND('expense', id),
      );
    }

    return { message: ERROR_MESSAGES.REGISTER_DELETED };
  }
}
