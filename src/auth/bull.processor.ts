import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Redis } from 'ioredis';
import { RedisClient } from 'ioredis/built/connectors/SentinelConnector/types';
import _ from 'lodash';

import nodemailer from 'nodemailer';
@Processor('valid')
export class ReservationProcessor {
  constructor(
    @InjectQueue('valid')
    private queue: Queue,
    @InjectRedis()
    private readonly redis: Redis,
  ) {}
  @Process('valid')
  async sendEmail(job: Job) {
    const { email, user } = job.data;
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'popcon940620@gmail.com',
        pass: 'prxosrkerxlmdnbe',
      },
    });

    const randomNum = Math.floor(Math.random() * 5000) + 1000;

    // 메일 옵션 설정
    let mailOptions = {
      from: 'popcon940620@gmail.com',
      to: email,
      subject: '인증코드왔음',
      text: `인증코드입니다.${randomNum}`,
    };

    // 메일 발송
    let info = await transporter.sendMail(mailOptions);
    if (_.isNil(info)) {
      console.log('메일 전송 실패');
    } else {
      console.log(`${email}로 이메일 전송 성공`);
    }
    await this.redis.hset(`${randomNum}`, { email, userId: user.userId });
    await this.redis.expire(`${randomNum}`, 180);
  }

  // Bull 컨슈머에서 작업 처리 예시
}
