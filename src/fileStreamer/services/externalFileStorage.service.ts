import { StreamableFile } from "@nestjs/common";
import { FileStorageService } from "./fileStorage.service";

export class ExternalFileStorageService extends FileStorageService {
    saveFile(file: Express.Multer.File, destination?: string): string {
        throw new Error("Method not implemented.");
    }

    streamFile(path: string): StreamableFile {
        throw new Error("Method not implemented.");
    }
}
