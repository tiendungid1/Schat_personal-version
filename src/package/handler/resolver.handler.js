import express from 'express';

export class ResolverHandler {
    #globalRouter = express.Router();

    /**
     * @type {import('../swagger/core/core')} swagger instance
     */
    #swagger;

    static builder() {
        return new ResolverHandler();
    }

    /**
     *
     * @param {[import('./Module').Module]} modules
     */
    addModule(modules) {
        modules.forEach(module => {
            module.build(this.#globalRouter);
            module.buildSwagger(this.#swagger);
        });
        return this;
    }

    addSwaggerBuilder(swagger) {
        this.#swagger = swagger;
        return this;
    }

    /**
     *
     * @returns {import('express').Router}
     */
    resolve() {
        return this.#globalRouter;
    }
}
