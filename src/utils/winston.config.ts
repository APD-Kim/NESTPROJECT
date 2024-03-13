import winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';
import moment from 'moment-timezone';
import { WinstonModule, utilities } from 'nest-winston';

const isProduction = process.env['NODE_ENV'] === 'production';
const logDir = __dirname + '/../../logs';
const appendTimestamp = winston.format((info, opts) => {
  if (opts.tz) {
    info.timestamp = moment().tz(opts.tz).format();
  }
  return info;
});

//로그 저장 파일 옵션
const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: logDir,
    filename: 'app.log.%DATE%',
    maxFiles: '30d',
    zippedArchive: true,
    handleExceptions: true,
    maxSize: '20m',
    json: false,
  };
};

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      //현재 환경이 프로덕션 환경이라면 http레벨, 아니라면 silly(가장 낮은 레벨)
      level: isProduction ? 'http' : 'silly',
      format: isProduction
        ? winston.format.simple() //프로덕션 환경이라면 심플하게
        : winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike('MyApp', {
              colors: true,
              prettyPrint: true, //로그를 보기좋게 출력 + 개발 환경이라면 시간까지 포함해서 보기좋게 출력해줌
            }),
          ),
    }),
    new winstonDaily(dailyOptions('warn')),
    new winstonDaily(dailyOptions('info')),
    new winstonDaily(dailyOptions('error')),
  ],
  //포맷 지정
  format: winston.format.combine(
    appendTimestamp({ tz: 'Asia/Seoul' }),
    winston.format.json(),
    winston.format.printf((info) => {
      return `${info.timestamp} - ${info.level} [${process.pid}]: ${info.message}`;
    }),
  ),
});
