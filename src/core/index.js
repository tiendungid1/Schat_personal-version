import './config/config-service.config';
import './config/rest-builder.config';
import express from 'express';
import {
    AuthorizationLookup,
    AuthorizationValidator,
} from 'package/authModel/module/authorization';
import { SecurityFilter } from 'package/authModel/core/security/security-filter';
import { HttpExceptionFilter } from 'package/httpException/HttpExceptionFilter';
import { InvalidUrlFilter } from 'package/handler/filter';
import { ApiDocument } from './config/swagger.config';
import { AppBundle } from './config/bundle.config';
import { ModuleResolver } from './api';

const app = express();

(async () => {
    await AppBundle.builder()
        .applyAppContext(app)
        .init()
        .applyGlobalFilters([new SecurityFilter()])
        .applyResolver(ModuleResolver)
        .applyUI()
        .applySwagger(ApiDocument)
        .applyGlobalFilters([new HttpExceptionFilter(), new InvalidUrlFilter()])
        .run();
    const container = await new AuthorizationLookup().collect();
    AuthorizationValidator.addAuthorizeStore(container);
})();

export default app;
