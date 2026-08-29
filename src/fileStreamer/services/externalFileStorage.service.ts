import { StreamableFile } from "@nestjs/common";
import { FileStorageService } from "./fileStorage.service.js";

export class ExternalFileStorageService extends FileStorageService {
    saveFile(_file: Express.Multer.File, _destination?: string): string {
        throw new Error("Method not implemented.");
    }

    streamFile(_path: string): StreamableFile {
        throw new Error("Method not implemented.");
    }
}
