/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import mongoose from 'mongoose';
import { BaseContainer } from 'package/container/core/container';
import { MogpConfig } from 'package/mogp/core/config';
import { MigrationModel } from 'package/mogp/model/Migration';
import { parallel } from 'package/taskExecution';
import { BaseProcessor } from '../base/base-processor';

/**
 * Currently will delete all the tables
 */
export class RollbackProcessor extends BaseProcessor {
    constructor() {
        const container = new BaseContainer();
        container.pattern = MogpConfig.getConfig().pathRollback;
        super(container);
    }

    async preProcess(tasks) {
        await MigrationModel.deleteMany();
    }

    afterRun(task) {}

    afterProcess() {}

    async process() {
        console.log('\x1B[92mConnecting to database');

        try {
            await mongoose.connect(MogpConfig.getConfig().connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        } catch (error) {
            throw new Error(
                'Please recheck connectionString in mogp.config.json',
            );
        }

        await this.collector.collect();
        await parallel(Object.keys(this.collector.store), key =>
            this.collector.store[key].deleteMany(),
        );

        await this.preProcess();
        console.log('Finish collect instances');
        console.log('\x1B[31mStart process');
        console.log('\x1B[31mFinish process');
    }
}
