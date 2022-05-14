/* eslint-disable operator-linebreak */
/* eslint-disable array-callback-return */
// eslint-disable-next-line no-unused-vars
import { Socket } from 'socket.io';
import Joi from 'joi';
import { BadRequestError } from '../response/exception';
import { TypeUtil, ArrayObjectUtil } from '../../../utils';
import { invalidResponse } from '../response';

const JoiEmailSchema = Joi.object({
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
    }),
});

/**
 * @param {Socket} socket
 * @param {String} event
 * @param {Object} dto
 * @param {Array<String>} dtoProperties
 * @returns {Boolean}
 */
export function errorInRequestDto(socket, event, dto, dtoProperties) {
    const { senderEmail } = dto;
    const { receiverEmail } = dto;
    const { memberEmail } = dto;
    const { memberEmails } = dto;
    const { userEmails } = dto;

    /**
     * Return if empty dto
     */
    if (TypeUtil.isEmptyObj(dto)) {
        socket.emit(
            event,
            invalidResponse(new BadRequestError('Empty data transfer object')),
        );
        return true;
    }

    /**
     * Return if missing properties
     */
    const missingProperties = ArrayObjectUtil.filterMissingProperties(
        dto,
        dtoProperties,
    );

    if (!TypeUtil.isEmptyArray(missingProperties)) {
        socket.emit(
            event,
            invalidResponse({
                ...new BadRequestError('Missing properties in data object'),
                missingProperties,
            }),
        );
        return true;
    }

    /**
     * Return if the values of properties is not a valid email
     */
    const emailErrors = [];

    [senderEmail, receiverEmail, memberEmail, memberEmails, userEmails].forEach(
        el => {
            if (!TypeUtil.isUndefined(el) && !Array.isArray(el)) {
                const { error } = JoiEmailSchema.validate({ email: el });
                if (error) emailErrors.push(error);
            }

            if (Array.isArray(el)) {
                emailErrors.push(
                    ArrayObjectUtil.filterUndefinedValues(
                        el.map(e => {
                            const { error } = JoiEmailSchema.validate({
                                email: e,
                            });
                            if (error) return error;
                        }),
                    ),
                );
            }
        },
    );

    if (!TypeUtil.isEmptyArray(emailErrors.flat(2))) {
        socket.emit(
            event,
            invalidResponse({ ...new BadRequestError(), emailErrors }),
        );
        return true;
    }

    /**
     * Return if the values of properties is not string
     */
    const nonStringValues = TypeUtil.filterNonStringValueInObj(
        dto,
        'senderEmail',
        'receiverEmail',
        'memberEmail',
        'memberEmails',
        'userEmails',
    );

    if (!TypeUtil.isEmptyArray(nonStringValues)) {
        socket.emit(
            event,
            invalidResponse({
                ...new BadRequestError(
                    'Some values of properties in data transfer object is not string',
                ),
                nonStringValues,
            }),
        );
        return true;
    }
}
