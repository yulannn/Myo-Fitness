import { Controller, Patch, Param, Body } from '@nestjs/common';
import { SessionService } from './session.service';
import { UpdateSessionDateDto } from './dto/update-session.dto';

@Controller('api/v1/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Patch(':id/date')
  updateDate(
    @Param('id') id: string,
    @Body() updateSessionDateDto: UpdateSessionDateDto,
  ) {
    return this.sessionService.updateDate(Number(id), updateSessionDateDto);
  }
}
