import { StreamableFile } from "@nestjs/common";
import { FileStreamerService } from "./FileStreamer.service";

export class ExternalFileStreamer extends FileStreamerService {
    streamFile(path: string): StreamableFile {
        throw new Error("Method not implemented.");
    }
}
