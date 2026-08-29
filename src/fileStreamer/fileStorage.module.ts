import { Module } from "@nestjs/common";
import { StreamerController } from "./controllers/streamer.controller.js";
import { FSFileStorageService } from "./services/fsFileStorage.service.js";
import { ExternalFileStorageService } from "./services/externalFileStorage.service.js";

@Module({
    controllers: [StreamerController],
    providers: [FSFileStorageService, ExternalFileStorageService],
    exports: [FSFileStorageService],
})
export class FileStorageModule {}
