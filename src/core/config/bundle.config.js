/* eslint-disable operator-linebreak */
import * as express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import methodOverride from 'method-override';
import { ConfigService } from 'package/config';
import { LoggerFactory } from 'package/logger';
import { InvalidFilter, InvalidResolver } from 'core/common/exception/system';
import { join } from 'path';
import fileUpload from 'express-fileupload';
import { clientRouter } from 'core/routes';
import { DatabaseInstance } from './database.config';

export class AppBundle {
    static ROOT_DIR = process.cwd();

    static VIEW_PATH = join(AppBundle.ROOT_DIR, 'views');

    static PUBLIC_PATH = join(AppBundle.ROOT_DIR, 'public/');

    static TEMP_FILE_UPLOAD_PATH = join(AppBundle.ROOT_DIR, 'uploads');

    BASE_PATH = '/api';

    BASE_PATH_SWAGGER = '/docs';

    CLIENT_PATH = '/';

    static builder() {
        LoggerFactory.globalLogger.info('App is starting bundling');
        return new AppBundle();
    }

    /**
     * @param {import("express-serve-static-core").Express} app
     */
    applyAppContext(app) {
        this.app = app;
        return this;
    }

    applyResolver(resolver) {
        if (!resolver['resolve']) {
            throw new InvalidResolver(resolver);
        }
        this.app.use(this.BASE_PATH, resolver.resolve());
        return this;
    }

    applyUI() {
        this.app.use(this.CLIENT_PATH, clientRouter);
        return this;
    }

    /**
     *
     * @param {[Filter]} filters
     * @returns {AppBundle}
     */
    applyGlobalFilters(filters) {
        filters.forEach(filter => {
            if (filter['filter']) {
                this.app.use(filter.filter);
            } else {
                throw new InvalidFilter(filter);
            }
        });
        return this;
    }

    applySwagger(swaggerBuilder) {
        // if (NODE_ENV !== 'production') {
        this.app.use(
            this.BASE_PATH_SWAGGER,
            swaggerUi.serve,
            swaggerUi.setup(swaggerBuilder.instance),
        );
        LoggerFactory.globalLogger.info('Building swagger');
        // }
        return this;
    }

    /**
     * Default config
     */
    init() {
        LoggerFactory.globalLogger.info(
            `Application is in mode [${ConfigService.getSingleton().get(
                'NODE_ENV',
            )}]`,
        );

        /**
         * Setup basic express
         */
        this.app.use(
            cors({
                origin: ConfigService.getSingleton().get('CORS_ALLOW'),
                optionsSuccessStatus: 200,
            }),
        );
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));

        /**
         * Setup view engine
         */
        this.app.set('view engine', 'pug');
        this.app.set('views', AppBundle.VIEW_PATH);
        this.app.use(
            express.static(AppBundle.PUBLIC_PATH, {
                etag: true,
                cacheControl: true,
                maxAge: 8000,
            }),
        );

        /**
         * Setup method override method to use PUT, PATCH,...
         */
        this.app.use(methodOverride('X-HTTP-Method-Override'));
        this.app.use(
            methodOverride(req => {
                if (
                    req.body &&
                    typeof req.body === 'object' &&
                    '_method' in req.body
                ) {
                    const method = req.body._method;
                    delete req.body._method;

                    return method;
                }

                return undefined;
            }),
        );

        /**
         * Setup express file upload
         */
        this.app.use(
            fileUpload({
                limits: { fileSize: 2048 * 2048 },
                useTempFiles: true,
                tempFileDir: AppBundle.TEMP_FILE_UPLOAD_PATH,
            }),
        );

        LoggerFactory.globalLogger.info('Building initial config');

        return this;
    }

    /*
    Setup asynchronous config here
     */
    async run() {
        LoggerFactory.globalLogger.info('Building asynchronous config');
        await DatabaseInstance.connect();
    }
}
