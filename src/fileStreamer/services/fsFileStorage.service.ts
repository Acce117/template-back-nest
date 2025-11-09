import { createReadStream, createWriteStream, existsSync, rmSync } from "fs";
import { StreamableFile } from "@nestjs/common";
import { join } from "path";
import { FileStorageService } from "./fileStorage.service";

export class FSFileStorageService extends FileStorageService {
    basePath: string = './uploads/';

    saveFile(file: Express.Multer.File, filePath): string {
        const f = createWriteStream(filePath);

        try {
            f.write(file.buffer);
        } catch (err) {
            this.deleteFile(filePath);
        } finally {
            f.end();
        }

        return filePath;
    }

    streamFile(path: string): StreamableFile {
        const file = createReadStream(
            join(process.cwd(), this.basePath, path),
        );
        return new StreamableFile(file);
    }


    private deleteFile(file_path: string) {
        const result = existsSync(file_path);
        if (result) {
            rmSync(file_path);
        }
        return result;
    }
}
