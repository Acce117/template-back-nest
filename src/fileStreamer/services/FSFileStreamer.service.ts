import { createReadStream } from "fs";
import { FileStreamerService } from "./FileStreamer.service";
import { StreamableFile } from "@nestjs/common";
import { join } from "path";

export class FSFileStreamer extends FileStreamerService {
    streamFile(path: string): StreamableFile {
        const file = createReadStream(
            join(process.cwd(), this.base_path, path),
        );
        return new StreamableFile(file);
    }
}
