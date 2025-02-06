import {
    applyDecorators,
    CallHandler,
    ExecutionContext,
    NestInterceptor,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { Observable } from "rxjs";

interface FileInBodyOptions {
    multipleFiles?: boolean;
}

export class FileInBodyInterceptor implements NestInterceptor {
    constructor(
        private fieldName: string,
        private bodyField: string = fieldName,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        if (req.file) req.body[`${this.bodyField}`] = req.file;

        return next.handle();
    }
}

export function FileInBody(
    fieldName,
    options: FileInBodyOptions = { multipleFiles: false },
) {
    return applyDecorators(
        UseInterceptors(
            options.multipleFiles
                ? FilesInterceptor(fieldName)
                : FileInterceptor(fieldName, {}),
            new FileInBodyInterceptor(fieldName),
        ),
    );
}
