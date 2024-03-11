import { IsBoolean, IsDate, IsNotEmpty, IsString, Matches, MaxLength, MinLength, isDate } from 'class-validator';
import { Equal } from 'typeorm';

export class CreateUserCredentialDto {
  @IsString({ message: '유저이름을 입력해주세요' })
  @MinLength(3, { message: '유저이름은 3자 이상이여야 합니다.' })
  @MaxLength(10, { message: '유저이름은 10자 이하여야 합니다.' })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: `아이디는 영어와 숫자로 이루어져야합니다.`,
  })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  @MinLength(6, { message: '비밀번호는 6자 이상이여야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 20자 이하여야 합니다.' })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: `비밀번호는 영어와 숫자로 이루어져야합니다.`,
  })
  password: string;
}
