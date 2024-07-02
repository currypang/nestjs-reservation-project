import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateShowDto } from './dto/create-show.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/types/user-role.type';

@UseGuards(RolesGuard)
@Controller('show')
export class ShowController {
  constructor(private readonly showService: ShowService) {}
  // 공연 등록
  @Roles(Role.Admin)
  @Post()
  async createShow(@Body() createShowDto: CreateShowDto) {
    const createdShow = await this.showService.createShow(
      createShowDto.name,
      createShowDto.description,
      createShowDto.category,
      createShowDto.location,
      createShowDto.price,
      createShowDto.img,
      createShowDto.time,
      createShowDto.seatInfo,
    );
    return {
      status: HttpStatus.CREATED,
      message: '공연 등록이 성공하였습니다.',
      data: createdShow,
    };
  }
}
