import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { ConcertService } from './concert.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Concert } from './entities/concert.entity';
import { SearchConcertNameDto } from './dto/search-concert.dto';

@Controller('concert')
export class ConcertController {
  logger = new Logger();
  constructor(private readonly concertService: ConcertService) {}

  @Post()
  @UseGuards(RolesGuard)
  create(@Body() createConcertDto: CreateConcertDto) {
    return this.concertService.create(createConcertDto);
  }
  @Get('/search')
  searchConcert(@Body() searchConcertNameDto: SearchConcertNameDto) {
    return this.concertService.searchConcert(searchConcertNameDto);
  }

  @Get()
  async findAll() {
    this.logger.verbose('signup 메서드 실행');
    const a = await this.concertService.findAll();
    return a;
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) concertId: number) {
    return await this.concertService.findOneConcert(concertId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.concertService.remove(+id);
  }
}
