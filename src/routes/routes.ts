import { Routes } from "@nestjs/core";
import { SiteModule } from "../site/site.module.js";
import { UsersModule } from "../users/users.module.js";

export const routes: Routes = [
    {
        path: "/",
        children: [
            { path: "users", module: UsersModule },
            { path: "site", module: SiteModule },
        ],
    },
];
