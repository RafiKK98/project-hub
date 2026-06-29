import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Get('/test')
  @Public()
  test(): string {
    return 'Hello World!';
  }
}
