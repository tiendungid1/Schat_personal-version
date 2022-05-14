import { ResolverHandler } from 'package/handler';
import { UserResolver } from './user';
import { MediaResolver } from './media';
import { ApiDocument } from '../config/swagger.config';

export const ModuleResolver = ResolverHandler.builder()
    .addSwaggerBuilder(ApiDocument)
    .addModule([UserResolver, MediaResolver]);
