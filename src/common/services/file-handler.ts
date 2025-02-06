import { Injectable } from "@nestjs/common";
import { createWriteStream, existsSync, rmSync } from "fs";

export interface FileHandler {
    readonly base_path: string;
    saveFile(file: Express.Multer.File, destination?: string): string;
}

@Injectable()
export class FSFileHandler implements FileHandler {
    readonly base_path: string = "./uploads/";

    saveFile(file: Express.Multer.File, destination?: string): string {
        let file_path = `${this.base_path}`;
        destination
            ? (file_path += `${destination}/${Date.now()}.${file.mimetype.split("/")[1]}`)
            : (file_path += `${Date.now()}.${file.mimetype.split("/")[1]}`);

        try {
            const f = createWriteStream(file_path);
            f.write(file.buffer);
            f.end();
        } catch (err) {
            this.deleteFile(file_path);
        }

        return file_path;
    }

    private deleteFile(file_path: string) {
        const result = existsSync(file_path);
        if (result) {
            rmSync(file_path);
        }
        return result;
    }
}

@Injectable()
export class ExternalFileHandler implements FileHandler {
    readonly base_path: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    saveFile(file: Express.Multer.File, destination?: string): string {
        throw new Error("Method not implemented.");
    }
}
