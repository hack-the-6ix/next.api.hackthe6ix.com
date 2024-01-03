import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FormService } from './form.service';
import {
  CurrentUser,
  Paginated,
  PaginatedResult,
  Protected,
  SkipQuery,
  TakeQuery,
} from 'src/decorators';
import { SerializedForm, CreateFormDto, UpdateFormDto } from './form.dto';

@Controller('forms')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Get()
  @Paginated(SerializedForm)
  @Protected()
  async getForms(
    @CurrentUser() currentUser: TypedUser,
    @TakeQuery() take: number,
    @SkipQuery() skip: number,
  ) {
    const [items, total] = await this.formService.list(currentUser, take, skip);
    return new PaginatedResult({
      items: items.map(this.formService.serialize),
      total,
      take,
      skip,
    });
  }

  @Post()
  @Protected()
  async createForms(
    @CurrentUser() currentUser: TypedUser,
    @Body() data: CreateFormDto,
  ) {
    const form = await this.formService.create(currentUser, data);
    return this.formService.serialize(form);
  }

  @Get('/:formId')
  async getForm(
    @CurrentUser() currentUser: TypedUser,
    @Param('formId') formId: string,
  ) {
    const form = await this.formService.get(currentUser, formId);
    return this.formService.serialize(form);
  }

  @Post('/:formId')
  @Protected()
  async updateForm(
    @CurrentUser() currentUser: TypedUser,
    @Param('formId') formId: string,
    @Body() data: UpdateFormDto,
  ) {
    const updatedForm = await this.formService.update(
      currentUser,
      formId,
      data,
    );
    return this.formService.serialize(updatedForm);
  }
}
