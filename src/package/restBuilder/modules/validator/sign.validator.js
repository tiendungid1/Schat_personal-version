import { BadRequestException } from 'package/httpException';
import { FilterSign } from '../../enum';

export class FilterSignValidator {
    validate(obj) {
        const sign = obj[1];
        if (!FilterSign[sign]) throw new BadRequestException('Sign in filter is not valid');
    }
}
