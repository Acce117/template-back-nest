import { DataSource } from "typeorm";
import { Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { describe, expect, it, jest } from "@jest/globals";
import { als } from "../../integrations/als/als-instance.js";
import { UnitOfWorkBuilder } from "./uow-builder.service.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let labelCounter = 0;
const makeManager = (label: string) => ({ __label: label });

const createQueryRunnerMock = (manager: any) => ({
    manager,
    startTransaction: jest.fn(async () => {}),
    commitTransaction: jest.fn(async () => {}),
    rollbackTransaction: jest.fn(async () => {}),
    release: jest.fn(async () => {}),
});

const createDataSourceMock = (defaultManager: any) => {
    const queryRunners: any[] = [];
    return {
        manager: defaultManager,
        createQueryRunner: jest.fn(() => {
            const qr = createQueryRunnerMock(
                makeManager(`tx-${++labelCounter}`),
            );
            queryRunners.push(qr);
            return qr;
        }),
        __queryRunners: queryRunners,
    };
};

describe("UnitOfWorkBuilder", () => {
    describe("aislamiento entre requests", () => {
        it("una request no ve el manager transaccional de otra en paralelo", async () => {
            const defaultManager = makeManager("default");
            const dataSource = createDataSourceMock(defaultManager);
            const builder = new UnitOfWorkBuilder(
                dataSource as unknown as DataSource,
            );

            let txManagerOfA: any = null;

            const [resultA, resultB] = await Promise.all([
                als.run(new Map(), async () => {
                    expect(builder.getManager()).toBe(defaultManager);

                    await builder.doTransactional(async (manager) => {
                        txManagerOfA = manager;
                        expect(builder.getManager()).toBe(manager);

                        await sleep(50);
                    });

                    expect(builder.getManager()).toBe(defaultManager);
                    return "A";
                }),
                als.run(new Map(), async () => {
                    await sleep(10);

                    expect(builder.getManager()).toBe(defaultManager);
                    return "B";
                }),
            ]);

            expect(resultA).toBe("A");
            expect(resultB).toBe("B");
            expect(txManagerOfA).not.toBe(defaultManager);
        });

        it("el store de ALS de una request es independiente del de otra", async () => {
            const [storeA, storeB] = await Promise.all([
                als.run(new Map([["userId", "user-a"]]), async () => {
                    const store = als.getStore() as Map<string, any>;
                    store.set("extra", "a");
                    await sleep(50);
                    return store;
                }),
                als.run(new Map([["userId", "user-b"]]), async () => {
                    await sleep(10);
                    return als.getStore() as Map<string, any>;
                }),
            ]);

            expect(storeA.get("userId")).toBe("user-a");
            expect(storeB.get("userId")).toBe("user-b");
            expect(storeB.has("extra")).toBe(false);
        });
    });

    describe("transacciones", () => {
        it("devuelve el manager por defecto fuera de una transaccion", () => {
            const defaultManager = makeManager("default");
            const dataSource = createDataSourceMock(defaultManager);
            const builder = new UnitOfWorkBuilder(
                dataSource as unknown as DataSource,
            );

            expect(builder.getManager()).toBe(defaultManager);
        });

        it("getManager devuelve el manager transaccional dentro de doTransactional", async () => {
            const defaultManager = makeManager("default");
            const dataSource = createDataSourceMock(defaultManager);
            const builder = new UnitOfWorkBuilder(
                dataSource as unknown as DataSource,
            );

            let txManagerInside: any = null;

            await als.run(new Map(), async () => {
                await builder.doTransactional(async (manager) => {
                    txManagerInside = manager;
                    expect(builder.getManager()).toBe(manager);
                });

                expect(builder.getManager()).toBe(defaultManager);
            });

            expect(txManagerInside).not.toBe(defaultManager);
            const qr = dataSource.__queryRunners[0];
            expect(qr.startTransaction).toHaveBeenCalled();
            expect(qr.commitTransaction).toHaveBeenCalled();
            expect(qr.release).toHaveBeenCalled();
        });

        it("restaura el manager externo tras una transaccion anidada", async () => {
            const defaultManager = makeManager("default");
            const dataSource = createDataSourceMock(defaultManager);
            const builder = new UnitOfWorkBuilder(
                dataSource as unknown as DataSource,
            );

            await als.run(new Map(), async () => {
                await builder.doTransactional(async (outer) => {
                    expect(builder.getManager()).toBe(outer);

                    await builder.doTransactional(async (inner) => {
                        expect(builder.getManager()).toBe(inner);
                        expect(inner).not.toBe(outer);
                    });

                    expect(builder.getManager()).toBe(outer);
                });

                expect(builder.getManager()).toBe(defaultManager);
            });

            const [outerQr, innerQr] = dataSource.__queryRunners;
            expect(outerQr.commitTransaction).toHaveBeenCalled();
            expect(innerQr.commitTransaction).toHaveBeenCalled();
        });

        it("hace rollback y propaga el error si la funcion falla", async () => {
            const defaultManager = makeManager("default");
            const dataSource = createDataSourceMock(defaultManager);
            const builder = new UnitOfWorkBuilder(
                dataSource as unknown as DataSource,
            );

            await expect(
                als.run(new Map(), () =>
                    builder.doTransactional(async () => {
                        throw new Error("boom");
                    }),
                ),
            ).rejects.toThrow("boom");

            const qr = dataSource.__queryRunners[0];
            expect(qr.rollbackTransaction).toHaveBeenCalled();
            expect(qr.commitTransaction).not.toHaveBeenCalled();
            expect(qr.release).toHaveBeenCalled();
            expect(builder.getManager()).toBe(defaultManager);
        });

        it("funciona fuera de un contexto ALS (background job)", async () => {
            const defaultManager = makeManager("default");
            const dataSource = createDataSourceMock(defaultManager);
            const builder = new UnitOfWorkBuilder(
                dataSource as unknown as DataSource,
            );

            const result = await builder.doTransactional(async () => "ok");

            expect(result).toBe("ok");
            expect(dataSource.createQueryRunner).toHaveBeenCalled();
            expect(builder.getManager()).toBe(defaultManager);
        });
    });

    describe("registro DI", () => {
        it("se resuelve como singleton", async () => {
            const defaultManager = makeManager("default");
            const dataSource = createDataSourceMock(defaultManager);

            @Module({
                providers: [
                    UnitOfWorkBuilder,
                    { provide: DataSource, useValue: dataSource },
                ],
            })
            class TestModule {}

            const moduleRef = await Test.createTestingModule({
                imports: [TestModule],
            }).compile();

            const first = moduleRef.get(UnitOfWorkBuilder);
            const second = moduleRef.get(UnitOfWorkBuilder);

            expect(first).toBe(second);
        });
    });
});
