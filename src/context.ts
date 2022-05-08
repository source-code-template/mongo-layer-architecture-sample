import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from 'express-ext';
import { Db } from 'mongodb';
import { buildQuery, MongoChecker, SearchBuilder } from 'mongodb-extension';
import { createValidator } from 'xvalidators';

import { UserController } from './controller/user';
import { User, UserFilter, userModel } from './metadata/user';
import { MongoUserRepository } from './repository/user';
import { useUserService } from './service/user';

resources.createValidator = createValidator;

export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  middleware: MiddlewareController;
  user: UserController;
}
export function useContext(db: Db, logger: Logger, midLogger: Middleware): ApplicationContext {
  const log = new LogController(logger);
  const middleware = new MiddlewareController(midLogger);
  const mongoChecker = new MongoChecker(db);
  const health = new HealthController([mongoChecker]);

  const userSearchBuilder = new SearchBuilder<User, UserFilter>(db, 'user', buildQuery, userModel);
  const userRepository = new MongoUserRepository(db);
  const userService = useUserService(userSearchBuilder.search, userRepository);
  const user = new UserController(logger.error, userService);

  return { health, log, middleware, user };
}
