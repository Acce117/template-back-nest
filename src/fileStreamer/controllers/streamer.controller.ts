import { Controller, Get, Inject, Query, StreamableFile } from "@nestjs/common";
import { FileStreamerService } from "../services/FileStreamer.service";

@Controller("file")
export class StreamerController {
    @Inject("STREAMER_SERVICE") streamService: FileStreamerService;

    @Get()
    streamFile(@Query("path") path: string): StreamableFile {
        return this.streamService.streamFile(path);
    }
}
