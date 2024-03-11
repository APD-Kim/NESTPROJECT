import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateConcertDto, seatData } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { Seat } from '../seat/entities/seat.entity';
import { EntityManager, Like, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Concert } from './entities/concert.entity';
import { SeatGrade } from 'src/seat/seat-grade-enum';
import _ from 'lodash';
import { object } from 'joi';
import { NotFoundError } from 'rxjs';
import { SearchConcertNameDto } from './dto/search-concert.dto';

@Injectable()
export class ConcertService {
  constructor(
    @InjectRepository(Concert)
    private concertRepository: Repository<Concert>,
    @InjectEntityManager() private entityManager: EntityManager,
  ) {}
  //공연 생성 API
  async create(createConcertDto: CreateConcertDto) {
    const { seat, ...concertDto } = createConcertDto;
    const foundConcert = await this.concertRepository.findOneBy({ name: concertDto.name });
    if (!_.isNil(foundConcert)) {
      throw new ConflictException('이미 해당 콘서트가 존재합니다.');
    }
    await this.entityManager.transaction(async (manager) => {
      const createConcertDao: Concert = manager.create(Concert, concertDto);
      const createdConcertData: Concert = await manager.save(createConcertDao);
      for (const key in seat) {
        for (let count = 0; count < seat[key].count; count++) {
          const createSeatDao = manager.create(Seat, {
            concertId: createdConcertData.concertId,
            grade: key.toUpperCase(),
            price: seat[key].price,
          });
          await manager.save(createSeatDao);
        }
      }
    });
  }
  //공연 조회 API
  async findAll() {
    const concerts = await this.concertRepository.find({
      relations: ['seat'],
    });
    //각각의 콘서트의 데이터를 순회하면서 새로운 seat정보를 포함한 객체 생성
    const results = concerts.map((concert) => {
      const concertObj = { ...concert, seat: undefined };

      const totalSeatsInfo: seatData = {
        S: { price: 0, availableSeat: 0 },
        A: { price: 0, availableSeat: 0 },
        B: { price: 0, availableSeat: 0 },
      };

      // 좌석 정보 집계
      concert.seat.forEach(({ grade, price, isReserved }) => {
        const upperGrade: string = grade.toUpperCase();
        if (!isReserved && totalSeatsInfo[upperGrade]) {
          totalSeatsInfo[upperGrade].availableSeat += 1;
          totalSeatsInfo[upperGrade].price = price;
        }
      });
      return {
        ...concertObj,
        totalSeatsInfo,
      };
    });
    return results;
  }
  //공연 상세보기 api
  async findOneConcert(concertId: number): Promise<object> {
    const concert: Concert = await this.concertRepository.findOne({
      where: { concertId },
      relations: ['seat'],
    });
    if (_.isNil(concert)) {
      throw new NotFoundException('해당 콘서트에 대한 정보가 없습니다.');
    }

    const totalSeatsInfo: seatData = {
      S: { price: 0, availableSeat: 0 },
      A: { price: 0, availableSeat: 0 },
      B: { price: 0, availableSeat: 0 },
    };

    // 좌석 정보 집계
    concert.seat.forEach(({ grade, price, isReserved }) => {
      const upperGrade: string = grade.toUpperCase();
      if (!isReserved && totalSeatsInfo[upperGrade]) {
        totalSeatsInfo[upperGrade].availableSeat += 1;
        totalSeatsInfo[upperGrade].price = price;
      }
    });

    return {
      ...concert,
      seat: undefined,
      totalSeatsInfo,
    };
  }
  //공연 검색 api
  async searchConcert(searchConcertNameDto: SearchConcertNameDto): Promise<Concert[]> {
    let { name } = searchConcertNameDto;
    console.log(name);
    const searchName = `%${name}%`;

    const searchConcertDao = await this.concertRepository.find({
      where: {
        name: Like(searchName),
      },
    });
    if (_.isEmpty(searchConcertDao)) {
      throw new NotFoundException('검색 결과가 없습니다.');
    }
    return searchConcertDao;
  }

  remove(id: number) {
    return `This action removes a #${id} concert`;
  }
}
