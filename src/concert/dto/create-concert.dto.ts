import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ConcertCategory } from '../concert-category-enum';
import { SeatGrade } from 'src/seat/seat-grade-enum';

export interface seatData {
  S: {
    grade?: SeatGrade.s;
    availableSeat: number;
    price: number;
  };
  A: {
    grade?: SeatGrade.a;
    availableSeat: number;
    price: number;
  };
  B: {
    grade?: SeatGrade.b;
    availableSeat: number;
    price: number;
  };
}

export class CreateConcertDto {
  @IsString({ message: '콘서트 이름을 입력해주세요' })
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty({ message: '콘서트의 내용을 입력해주세요' })
  content: string;

  @IsString()
  @IsNotEmpty()
  place: string;

  @IsString()
  @IsNotEmpty()
  concertImage: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsEnum(ConcertCategory)
  @IsNotEmpty()
  concertCategory: ConcertCategory;

  @IsObject()
  seat: seatData;
}
