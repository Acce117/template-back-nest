import { Inject, StreamableFile } from "@nestjs/common";

export abstract class FileStreamerService {
    @Inject("BASE_PATH") base_path: string;

    abstract streamFile(path: string): StreamableFile;
}
