import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { QuestionService } from './question.service';
import { CurrentUser, Protected } from 'src/decorators';
import { CreateQuestionDto, UpdateQuestionDto } from './question.dto';

@Controller('forms/:formId/questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @Protected()
  async getQuestions(
    @CurrentUser() currentUser: TypedUser,
    @Param('formId') formId: string,
  ) {
    return this.questionService.list(currentUser, formId);
  }

  @Post()
  @Protected()
  async createQuestion(
    @CurrentUser() currentUser: TypedUser,
    @Param('formId') formId: string,
    @Body() data: CreateQuestionDto,
  ) {
    return this.questionService.create(currentUser, formId, data);
  }

  @Post('/:questionId')
  @Protected()
  async updateQuestion(
    @CurrentUser() currentUser: TypedUser,
    @Param('questionId') questionId: string,
    @Param('formId') formId: string,
    @Body() data: UpdateQuestionDto,
  ) {
    return this.questionService.update(currentUser, formId, questionId, data);
  }

  @Delete('/:questionId')
  @Protected()
  async deleteQuestion(
    @CurrentUser() currentUser: TypedUser,
    @Param('questionId') questionId: string,
    @Param('formId') formId: string,
  ) {
    return this.questionService.delete(currentUser, formId, questionId);
  }
}
