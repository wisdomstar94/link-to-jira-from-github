import { IIndexeddbManager } from "../utils/indexeddb-manager/indexeddb-manager.interface";

const getDefineSchemas = <DBNAME, STORENAME>(defineSchemas: IIndexeddbManager.DefineSchemas<DBNAME, STORENAME>) => defineSchemas;

export const defineSchemas = getDefineSchemas([
  {
    dbName: 'github_to_jira' as const,
    version: 3,
    defineStores: [
      {
        storeName: 'github_jira_setup_list' as const,
        storekeyPath: 'key',
        isIfExistDeleteThenCreate: false,
        storeIndexItems: [
          { indexName: `key_unique`, keyPath: `key`, options: { unique: true } },
        ],
      },
    ],
  },
]);

const _getDbVersion = <DBNAME, STORENAME>(defineSchemas: IIndexeddbManager.DefineSchemas<DBNAME, STORENAME>) => {
  return (dbName: DBNAME) => defineSchemas.find(x => x.dbName === dbName)?.version ?? 1;
};

export const getDbVersion = _getDbVersion(defineSchemas);