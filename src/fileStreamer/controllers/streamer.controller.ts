import { Controller, Get, Inject, Query, StreamableFile } from "@nestjs/common";
import { FileStorageService } from "../services/fileStorage.service";
import { FSFileStorageService } from "../services/fsFileStorage.service";

@Controller("file")
export class StreamerController {
    @Inject(FSFileStorageService) streamService: FileStorageService;

    @Get()
    streamFile(@Query("path") path: string): StreamableFile {
        return this.streamService.streamFile(path);
    }
}
