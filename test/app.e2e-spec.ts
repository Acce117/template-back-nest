import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module.js";

describe("App (e2e)", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix("/api");
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it("/api/is-auth (GET) returns isAuth false when no token", async () => {
        const res = await request(app.getHttpServer()).get("/api/is-auth");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ isAuth: false });
    });
});
