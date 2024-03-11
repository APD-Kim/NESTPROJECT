import { PickType } from '@nestjs/mapped-types';
import { CreateConcertDto } from './create-concert.dto';

export class SearchConcertNameDto extends PickType(CreateConcertDto, ['name'] as const) {}
