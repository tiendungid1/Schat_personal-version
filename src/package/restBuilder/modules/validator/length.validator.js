import { BadRequestException } from 'package/httpException';

export class LengthValidator {
    #message;

    #lengthValidate;

    constructor(lengthValidate, message) {
        this.#lengthValidate = lengthValidate;
        if (message) {
            this.#message = message;
        } else {
            this.#message = `Input format should be contain ${this.#lengthValidate} character`;
        }
    }

    validate(obj) {
        if (obj.length !== this.#lengthValidate) {
            throw new BadRequestException(this.#message);
        }
    }
}
