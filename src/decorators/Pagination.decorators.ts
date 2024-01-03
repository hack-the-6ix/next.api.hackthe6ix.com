import {
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  applyDecorators,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';

export class PaginatedResult<T> {
  @ApiProperty()
  take: number;

  @ApiProperty()
  skip: number;

  @ApiProperty()
  total: number;

  items: T[];

  constructor(data: PaginatedResult<T>) {
    Object.assign(this, data);
  }
}

export const Paginated = <T extends Constructor>(
  model: T,
  defaults: { take?: number; skip?: number } = {},
) => {
  return applyDecorators(
    ApiQuery({
      name: 'take',
      required: false,
      type: Number,
      schema: {
        default: defaults.take ?? 20,
        maximum: 100,
      },
    }),
    ApiQuery({
      name: 'skip',
      required: false,
      type: Number,
      schema: {
        default: defaults.skip ?? 0,
      },
    }),
    ApiExtraModels(PaginatedResult<T>, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResult<T>) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};

export const TakeQuery = (defaultValue = 20) =>
  Query(
    'take',
    new ParseIntPipe({ optional: true }),
    new DefaultValuePipe(defaultValue),
  );

export const SkipQuery = (defaultValue = 0) =>
  Query(
    'skip',
    new ParseIntPipe({ optional: true }),
    new DefaultValuePipe(defaultValue),
  );
