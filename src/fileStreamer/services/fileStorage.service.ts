import { StreamableFile } from "@nestjs/common";

export abstract class FileStorageService {
    basePath: string;

    generateFileName(file, destination?) {
        let filePath = `${this.basePath}`;

        return destination
            ? (filePath += `${destination}/${Date.now()}.${file.mimetype.split("/")[1]}`)
            : (filePath += `${Date.now()}.${file.mimetype.split("/")[1]}`);
    }

    abstract streamFile(path: string): StreamableFile;

    abstract saveFile(file: Express.Multer.File, filePath: string): string;
}
