import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { userSetter } from './middlewares/user.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(userSetter);

  await app.listen(3000);
}
bootstrap();
