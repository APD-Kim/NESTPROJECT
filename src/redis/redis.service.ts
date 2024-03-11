import { Inject, Injectable } from '@nestjs/common';
import { CreateRediDto } from './dto/create-redi.dto';
import { UpdateRediDto } from './dto/update-redi.dto';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('RedisClient')
    private readonly redisClient: Redis,
  ) {}
  async setKeyValue(key: string, value: string) {
    await this.redisClient.set(key, value);
  }

  findAll() {
    return `This action returns all redis`;
  }

  findOne(id: number) {
    return `This action returns a #${id} redi`;
  }

  update(id: number, updateRediDto: UpdateRediDto) {
    return `This action updates a #${id} redi`;
  }

  remove(id: number) {
    return `This action removes a #${id} redi`;
  }
}
