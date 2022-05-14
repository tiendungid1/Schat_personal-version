/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
import mongoose from 'mongoose';
import { MogpConfig } from '../../core/config';
import { BaseProcessor } from '../base/base-processor';
import { SeedingCollector } from '../collector/seeding-collector';

export class SeedingProcessor extends BaseProcessor {
    constructor() {
        super(SeedingCollector.builder());
    }

    preProcess(tasks) {
        this.setTasks(tasks.reverse());
    }

    afterProcess() {}

    afterRun(task) {}
}
