import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    //   {
    //   logger: ['fatal'],
    // }
  );
  // class-validator 사용하기위해 global pipe 사용
  // app.setGlobalPrefix('v1');
  // app.enableVersioning({
  // URL
  // type: VersioningType.URI,
  // defaultVersion: ['1', '2'],

  // HEADER
  // type: VersioningType.HEADER,
  // header: 'version',

  // MEDIA TYPE
  // type: VersioningType.MEDIA_TYPE,
  // key: 'v=',
  // });
  const config = new DocumentBuilder()
    .setTitle('NestJS_practice')
    .setDescription('Rest Api')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // dto에 정의된 타입만 사용한다 (데이터 핸들링)
      forbidNonWhitelisted: true, // dto에 정의되지 않은 타입은 에러를 반환
      transformOptions: {
        enableImplicitConversion: true, // dto에 적혀있는 타입으로 자동 타입 변환
      },
    }),
  );
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
