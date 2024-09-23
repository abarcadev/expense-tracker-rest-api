import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const salt = await bcrypt.genSalt();
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
      const { id } = await this.userModel.create(createUserDto);
      return { id };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(ERROR_MESSAGES.REGISTER_NOT_SAVED);
    }
  }

  async findAll(findAllUsersDto: FindAllUsersDto) {
    const {
      fullName,
      username,
      email,
      startDate,
      endDate,
      skip = 0,
      limit = 10,
    } = findAllUsersDto;

    const or = [
      { name: { $regex: fullName, $options: 'i' } },
      { lastName: { $regex: fullName, $options: 'i' } },
    ];

    const query = {
      ...(fullName && { $or: or }),
      ...(username && { username: { $regex: username, $options: 'i' } }),
      ...(email && { email: { $regex: email, $options: 'i' } }),
      ...(startDate &&
        endDate && {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        }),
    };

    const pipeline: PipelineStage[] = [
      { $match: query },
      {
        $project: {
          name: 1,
          lastName: 1,
          username: 1,
          email: 1,
        },
      },
      {
        $sort: {
          lastName: 1,
          name: 1,
          _id: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    const [data, total] = await Promise.all([
      this.userModel.aggregate(pipeline),
      this.userModel.countDocuments(query),
    ]);

    return {
      data,
      total,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findOne(
      { _id: id },
      'name lastName username email',
    );

    if (!user) {
      throw new NotFoundException(
        ERROR_MESSAGES.REGISTER_NOT_FOUND('user', id),
      );
    }

    return user;
  }

  findOneByEmail(email: string) {
    return this.userModel.findOne(
      { email },
      'name lastName username email password',
    );
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    try {
      const { password = null } = updateUserDto;

      if (password) {
        const salt = await bcrypt.genSalt();
        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          salt,
        );
      }

      await this.userModel.updateOne({ _id: id }, updateUserDto);
      return { id };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(ERROR_MESSAGES.REGISTER_NOT_SAVED);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.userModel.deleteOne({ _id: id });

    if (deletedCount === 0) {
      throw new NotFoundException(
        ERROR_MESSAGES.REGISTER_NOT_FOUND('user', id),
      );
    }

    return { message: ERROR_MESSAGES.REGISTER_DELETED };
  }
}
