import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { QuestionService } from './question.service';
import {
  CurrentUser,
  Paginated,
  PaginatedResult,
  Protected,
  SkipQuery,
  TakeQuery,
} from 'src/decorators';
import {
  CreateQuestionDto,
  SerializedQuestion,
  UpdateQuestionDto,
} from './question.dto';

@Controller('forms/:formId/questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @Paginated(SerializedQuestion)
  @Protected()
  async getQuestions(
    @CurrentUser() currentUser: TypedUser,
    @Param('formId') formId: string,
    @TakeQuery() take: number,
    @SkipQuery() skip: number,
  ) {
    const [items, total] = await this.questionService.list(
      currentUser,
      formId,
      take,
      skip,
    );
    return new PaginatedResult({
      items: items.map(this.questionService.serialize),
      total,
      take,
      skip,
    });
  }

  @Post()
  @Protected()
  async createQuestion(
    @CurrentUser() currentUser: TypedUser,
    @Param('formId') formId: string,
    @Body() data: CreateQuestionDto,
  ) {
    const question = await this.questionService.create(
      currentUser,
      formId,
      data,
    );
    return this.questionService.serialize(question);
  }

  @Post('/:questionId')
  @Protected()
  async updateQuestion(
    @CurrentUser() currentUser: TypedUser,
    @Param('questionId') questionId: string,
    @Param('formId') formId: string,
    @Body() data: UpdateQuestionDto,
  ) {
    const question = await this.questionService.update(
      currentUser,
      formId,
      questionId,
      data,
    );
    return this.questionService.serialize(question);
  }

  @Delete('/:questionId')
  @Protected()
  async deleteQuestion(
    @CurrentUser() currentUser: TypedUser,
    @Param('questionId') questionId: string,
    @Param('formId') formId: string,
  ) {
    await this.questionService.delete(currentUser, formId, questionId);
    return true;
  }


 
}
