import { merge } from 'lodash';
import {
    FileOutputFormat,
    LoggerFactory,
    TransportFactory,
    TransportGenerator,
} from 'package/logger';
import {
    FilterQuery,
    PaginationQuery,
    SearchQuery,
    SortQuery,
} from 'package/restBuilder/modules/query';
import {
    NotFoundError,
    InternalServerError,
} from 'core/modules/web-socket/response/exception';
import { DataRepository } from './data.repository';
import { documentCleanerVisitor } from './document-cleaner.visitor';

export class DataPersistenceService {
    static logger = LoggerFactory.createLogByTransportType(
        TransportFactory.create(
            TransportGenerator.File,
            new FileOutputFormat(DataPersistenceService.name),
        ),
    );

    repository;

    constructor(repository) {
        if (!(repository instanceof DataRepository)) {
            throw new Error(
                'Extended class DataPersistenceService should be constructed with a DataRepository instance',
            );
        }
        this.repository = repository;
    }

    /**
     *
     * @param {import('../requestTransformer/RequestTransformer').RequestTransformer} requestTransformer
     */
    getAndCount(requestTransformer) {
        return this.repository.getAndCount(
            new PaginationQuery(requestTransformer.content.pagination),
            new FilterQuery(requestTransformer.content.filters),
            new SortQuery(requestTransformer.content.sorts),
            new SearchQuery(requestTransformer.content.search),
            requestTransformer.content.main,
            requestTransformer.content.associates,
        );
    }

    get(requestTransformer) {
        return this.repository.get(
            new PaginationQuery(requestTransformer.content.pagination),
            new FilterQuery(requestTransformer.content.filters),
            new SortQuery(requestTransformer.content.sorts),
            new SearchQuery(requestTransformer.content.search),
            requestTransformer.content.main,
            requestTransformer.content.associates,
        );
    }

    getOne(requestTransformer) {
        return this.repository.getOne(
            new FilterQuery(requestTransformer.content.filters),
            new SearchQuery(requestTransformer.content.search),
            requestTransformer.content.main,
            requestTransformer.content.associates,
        );
    }

    /**
     * @deprecated This function is deprecated
     * @param {any} dto
     * @param {() => typeof import('package/httpException/HttpException').HttpException} exceptionDealingWithDatabaseError
     * @returns
     */
    async createOneSafetyDeprecated(dto, exceptionDealingWithDatabaseError) {
        let createdData;

        try {
            createdData = await this.repository.model.create(dto);
        } catch (e) {
            DataPersistenceService.logger.error(e.message);
            DataPersistenceService.logger.error(e.stack);
            throw exceptionDealingWithDatabaseError();
        }

        return createdData;
    }

    async createOneSafety(dto) {
        let createdData;

        try {
            createdData = await this.repository.model.create(dto);
        } catch (e) {
            DataPersistenceService.logger.error(e.message);
            DataPersistenceService.logger.error(e.stack);
            return new InternalServerError(
                'Getting internal error when trying to create new document',
            );
        }

        return createdData;
    }

    /**
     * @param {any} id
     * @param {Record<any, any>} sourceDocument
     * @param {Record<any, any>} updateDocument
     */
    async patchOne(id, sourceDocument, updateDocument) {
        const cleanedDoc = documentCleanerVisitor(updateDocument);
        const updateDoc = merge(sourceDocument, cleanedDoc);

        await this.repository.model.updateOne(
            {
                _id: id,
            },
            updateDoc,
        );
    }

    async updateArrayFieldOfOne(updateType, query, field) {
        switch (updateType) {
            case 'push':
                await this.repository.model.updateOne(query, { $push: field });
                break;

            case 'pull':
                await this.repository.model.updateOne(query, { $pull: field });
                break;
        }
    }

    async softDeleteById(id) {
        let isDeleted;
        try {
            isDeleted = await this.repository.softDeleteById(id);
        } catch (e) {
            DataPersistenceService.logger.error(e.message);
            DataPersistenceService.logger.error(e.stack);
            return new InternalServerError(
                'Getting internal error when trying to delete room',
            );
        }
        if (!isDeleted) {
            return new NotFoundError('Not found deleted room');
        }
        return isDeleted;
    }
}
