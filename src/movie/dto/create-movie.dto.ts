import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  detail: string;

  @IsNotEmpty()
  @IsNumber()
  directorId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  genreIds: number[];
}

// @Exclude()
// export class Movie {
//   @Expose()
//   id: number;
//   @Expose()
//   title: string;
//   @Transform(({ value }) => value.toUpperCase())
//   genre: string;

//   @Expose()
//   get description() {
//     return '영화 재밌어';
//   }
// }

// 기본
// @IsDefined() - null || undefined
// @IsOptional
// @Equals('code')
// @NotEquals('code')
// @IsEmpty() - null || undefined || ''
// @IsNotEmpty()
// @IsIn(['action', 'fantasy'])
// @IsNotIn(['action', 'fantasy'])

//타입
// @IsBoolean()
// @IsString()
// @IsNumber()
// @IsInt()
// @IsArray()
// @IsEnum(MovieGenre)
// @IsDate()
// @IsDateString()

// 숫자
// @IsDivisibleBy(5)
// @IsPositive()
// @IsNegative()
// @Min(100)
// @Max(200)

//문자
// @Contains('code')
// @NotContains('code')
// @IsAlphanumeric()
// @IsCreditCard()
// @IsHexColor()
// @MaxLength(5)
// @MinLength(1)
// @IsUUID()
// @IsLatLong()

// @Validate(PasswordValidator, {
//   message: '다른 에러 메세지',
// })
// @IsPasswordValid()

// enum MovieGenre {
//   Fantasy = 'fantasy',
//   Action = 'action',
// }

// 커스텀 validator
// @ValidatorConstraint({
//   async: true, // 비동기도 가능
// })
// class PasswordValidator implements ValidatorConstraintInterface {
//   validate(
//     value: any,
//     validationArguments?: ValidationArguments,
//   ): Promise<boolean> | boolean {
//     return value.length > 4 && value.length < 8;
//   }
//   defaultMessage?(validationArguments?: ValidationArguments): string {
//     return '비밀번호의 길이는 4-8자입니다. 입력 비밀번호 : ($value)';
//   }
// }

// function IsPasswordValid(validationOptions?: ValidationOptions) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName,
//       options: validationOptions,
//       validator: PasswordValidator,
//     });
//   };
// }
