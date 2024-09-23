import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true, set: (v: number) => Number(v).toFixed(2) })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId: Category;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
