import { Module } from "@nestjs/common";
import { StreamerController } from "./controllers/streamer.controller";
import { FSFileStorageService } from "./services/fsFileStorage.service";
import { ExternalFileStorageService } from "./services/externalFileStorage.service";

@Module({
    controllers: [StreamerController],
    providers: [
        FSFileStorageService,
        ExternalFileStorageService,
    ],
    exports: [FSFileStorageService],
})
export class FileStorageModule {}
