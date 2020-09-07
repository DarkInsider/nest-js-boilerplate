// registers aliases, DON'T REMOVE THIS LINE!
import 'module-alias/register';

import * as flash from 'connect-flash';
import * as redisStore from 'connect-redis';
import * as redis from 'redis';
import * as exphbs from 'express-handlebars';
import * as passport from 'passport';
import * as session from 'express-session';

import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

import AppModule from '@components/app/app.module';
import NotFoundExceptionFilter from '@filters/404.filter';

const redisClient = redis.createClient();
const RedisStore = redisStore(session);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new NotFoundExceptionFilter());

  const viewsPath = join(__dirname, '../public/views');
  app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main' }));
  app.set('views', viewsPath);
  app.set('view engine', '.hbs');


  app.use(
    session({
      secret: process.env.PASSPORT_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({
        host: 'redis',
        port: 6379,
        client: redisClient,
        ttl: 666,
      }),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  const port = process.env.SERVER_PORT || 3000;

  await app.listen(port, () => console.log(`The server is running on ${port} port`));
}
bootstrap();