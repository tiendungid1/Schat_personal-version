import { BaseContainer } from 'package/container/core/container';
import { MogpConfig } from 'package/mogp/core/config';

export class MigrationCollector extends BaseContainer {
    pattern = MogpConfig.getConfig().pathMigration;
}
