import { DynamicModule } from "@nestjs/common";
import { StreamerController } from "./controllers/streamer.controller";
import { FSFileStreamer } from "./services/FSFileStreamer.service";
import { ExternalFileStreamer } from "./services/ExternalFileStreamer.service";

interface StreamerOptions {
    location: "local" | "external";
    base_path: string;
}

export class StreamerModule {
    static register(options: StreamerOptions): DynamicModule {
        return {
            controllers: [StreamerController],
            providers: [
                {
                    provide: "STREAMER_SERVICE",
                    useClass:
                        options.location === "local"
                            ? FSFileStreamer
                            : ExternalFileStreamer,
                },
                {
                    provide: "BASE_PATH",
                    useValue: options.base_path,
                },
            ],
            exports: ["STREAMER_SERVICE"],
            module: StreamerController,
        };
    }
}
