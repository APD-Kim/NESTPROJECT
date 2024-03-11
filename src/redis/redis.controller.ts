import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CreateRediDto } from './dto/create-redi.dto';
import { UpdateRediDto } from './dto/update-redi.dto';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Post()
  async create() {
    const key = '1';
    const value = '2';
    await this.redisService.setKeyValue(key, value);
    return '저장 완료';
  }

  @Get()
  findAll() {
    return this.redisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.redisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRediDto: UpdateRediDto) {
    return this.redisService.update(+id, updateRediDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.redisService.remove(+id);
  }
}
