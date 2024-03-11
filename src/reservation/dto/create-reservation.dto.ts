import {
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SeatGrade } from 'src/seat/seat-grade-enum';
export type seatGrade = 'S' | 'A' | 'B' | string;
interface ReservationSeat {
  seatId: number;
  price: number;
  grade: seatGrade;
}

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty()
  concertId: number;

  @IsArray()
  @IsNotEmpty()
  reservationSeats: ReservationSeat[];
}
