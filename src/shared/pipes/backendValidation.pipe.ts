import { ArgumentMetadata, HttpException, HttpStatus, PipeTransform } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { ValidationError, validate } from "class-validator";

export class BackendValidationPipe implements PipeTransform {
    async transform(value: any, metatype: ArgumentMetadata) {
        const object = plainToClass(metatype.metatype, value)

        const errors = await validate(object)

        if (!errors?.length) return value

        throw new HttpException({ errors: this.formatErrors(errors) }, HttpStatus.UNPROCESSABLE_ENTITY)
    }

    formatErrors(errors: ValidationError[]) {
        return errors.reduce((acc, err) => {
            acc[err.property] = Object.values(err.constraints)
            return acc
        }, {})
    }
}