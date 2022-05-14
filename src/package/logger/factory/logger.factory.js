import { createLogger as create } from 'winston';
import { OutputFormat } from '../format';
import { TransportGenerator } from '../enum';
import { TransportFactory } from './transport.factory';

export class LoggerFactory {
    static globalLogger = LoggerFactory.create();

    static create(name) {
        return LoggerFactory.createLogByTransportType(
            TransportFactory.create(
                TransportGenerator.Console,
                new OutputFormat(name)
            )
        );
    }

    static createLogByTransportType(...transports) {
        return create({ transports });
    }
}
