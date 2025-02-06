import { Routes } from "@nestjs/core";
import { SiteModule } from "src/site/site.module";
import { UsersModule } from "src/users/users.module";

export const routes: Routes = [
    {
        path: "/",
        children: [
            { path: "users", module: UsersModule },
            { path: "site", module: SiteModule },
        ],
    },
];
