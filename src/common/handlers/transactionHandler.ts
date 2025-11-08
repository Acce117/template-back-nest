export interface TransactionHandler {
    dataSource: any;

    handle(cb: CallableFunction): Promise<any>;
}

export interface ManagerContainer {
    readonly manager;
}
