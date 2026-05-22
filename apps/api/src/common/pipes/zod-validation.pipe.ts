import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const message = (result.error as ZodError).errors
        .map((error) => {
          const path = error.path.length > 0 ? `${error.path.join('.')}: ` : '';
          return `${path}${error.message}`;
        })
        .join(', ');
      throw new BadRequestException(message);
    }
    return result.data;
  }
}
