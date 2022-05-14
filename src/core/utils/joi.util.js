import Joi from 'joi';

const MONGOOSE_ID_OBJECT_FORMAT = /^[0-9a-fA-F]{24}$/;

// Required from 6-30 char, contains special char
const PWD_FORMAT = /^[a-zA-Z0-9\d@$!%*?&]{6,30}$/;

export class JoiUtils {
    static objectId() {
        return Joi.string().regex(MONGOOSE_ID_OBJECT_FORMAT);
    }

    static optionalString() {
        return Joi
            .string()
            .optional();
    }

    static requiredString() {
        return Joi
            .string()
            .trim()
            .required();
    }

    static email = () => Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } });

    static password() {
        return Joi.string().regex(PWD_FORMAT);
    }

    static optionalStrings() {
        return Joi.array().items(JoiUtils.optionalString()).min(1);
    }
}
