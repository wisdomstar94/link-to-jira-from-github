import { IIndexeddbManager } from "./indexeddb-manager.interface";

export class IndexeddbManager<DBNAME extends string, STORENAME extends string> {
  defineSchemas: IIndexeddbManager.DefineSchema<DBNAME, STORENAME>[];
  onDefineSchemasResult: (result: IIndexeddbManager.DefineSchemaResults<DBNAME, STORENAME>) => void;

  isSchemasChecking: boolean;
  
  isReady: boolean;
  onChangeReady?: ((value: boolean) => void);

  isAbleIndexeddb: boolean = !!indexedDB;

  constructor(
    defineSchemas: IIndexeddbManager.DefineSchema<DBNAME, STORENAME>[], 
    onDefineSchemasResult: (result: IIndexeddbManager.DefineSchemaResults<DBNAME, STORENAME>) => void,
  ) {
    this.defineSchemas = defineSchemas;
    this.onDefineSchemasResult = onDefineSchemasResult;

    this.isSchemasChecking = false;
    this.isReady = false;
  }

  setOnChangeReady(callback: (value: boolean) => void) {
    this.onChangeReady = callback;
  }

  insertToStore<T extends { key: string }>(options: IIndexeddbManager.InsertOptions<T, DBNAME, STORENAME>) {
    if (!this.isAbleIndexeddb) {
      console.error(`indexed db 가 지원되지 않습니다.`);
      return;
    }

    const {
      dbName,
      version,
      storeName,
      isOverwrite,
      datas,
      onSuccess,
      onError,
    } = options;

    this.isExistStore(dbName, version, storeName, (isExist) => {
      if (!isExist) {
        onError();
      } else {
        call();
      }
    });

    const call = () => {
      let db: IDBDatabase;
      const result: IIndexeddbManager.InsertResult<T>[] = datas.map((item) => ({ key: item.key, isInsertSuccess: undefined, data: item }));
      const request = indexedDB.open(dbName, version);
      request.onsuccess = (event) => {
        db = (event.target as any).result;
        for (const data of datas) {
          const store = db.transaction([storeName], 'readonly').objectStore(storeName);
          const nowTimestamp = new Date().getTime();
          const storeTransaction = store.get(data.key);
          // eslint-disable-next-line no-loop-func
          storeTransaction.onsuccess = (_event) => {
            const store = db.transaction([storeName], 'readwrite').objectStore(storeName);
            const originalData = storeTransaction.result;
            if (originalData !== undefined) {
              // 존재함!
              if (isOverwrite) {
                (data as any).createdAt = originalData.createdAt;
                (data as any).updatedAt = nowTimestamp;
                const storeRequest = store.put(data);
                storeRequest.onsuccess = () => {
                  result.forEach(item => {
                    if (item.key === data.key) {
                      item.isInsertSuccess = true;
                    }
                  });
                  checkComplete();
                };
                storeRequest.onerror = () => {
                  result.forEach(item => {
                    if (item.key === data.key) {
                      item.isInsertSuccess = false;
                    }
                  });
                  checkComplete();
                };
              }
            } else {
              // 존재하지 않음!
              (data as any).createdAt = nowTimestamp;
              (data as any).updatedAt = nowTimestamp;
              const storeRequest = store.add(data);
              storeRequest.onsuccess = () => {
                result.forEach(item => {
                  if (item.key === data.key) {
                    item.isInsertSuccess = true;
                  }
                });
                checkComplete();
              };
              storeRequest.onerror = () => {
                result.forEach(item => {
                  if (item.key === data.key) {
                    item.isInsertSuccess = false;
                  }
                });
                checkComplete();
              };
            }
          };
        }
      };
      request.onerror = (event) => {
        onError(event);
        db?.close();
      };
      request.onupgradeneeded = (event) => {
        console.log('@onupgradeneeded', event);
        this.onUpgradeneededCallback(event, dbName);
      };

      function checkComplete() {
        const target = result.find(x => x.isInsertSuccess === undefined);
        if (target !== undefined) return;
        // complete!
        onSuccess(result);
        db.close();
      }
    };
  }

  deletesToStore(options: IIndexeddbManager.DeletesOptions<DBNAME, STORENAME>) {
    if (!this.isAbleIndexeddb) {
      console.error(`indexed db 가 지원되지 않습니다.`);
      return;
    }

    const {
      dbName,
      version,
      storeName,
      deleteKeys,
      onSuccess,
      onError,
    } = options;

    this.isExistStore(dbName, version, storeName, (isExist) => {
      if (!isExist) {
        onError();
      } else {
        call();
      }
    });

    const call = () => {
      let db: IDBDatabase;
      const request = indexedDB.open(dbName, version);
      const result: IIndexeddbManager.DeleteResult[] = deleteKeys.map(x => ({ key: x, isDeleteSuccess: undefined }));
      request.onsuccess = (event) => {
        db = (event.target as any).result;
        for (const deleteKey of deleteKeys) {
          const store = db.transaction([storeName], 'readwrite').objectStore(storeName);
          const storeTransaction = store.delete(deleteKey);
          storeTransaction.onsuccess = () => {
            result.forEach(item => {
              if (item.key === deleteKey) {
                item.isDeleteSuccess = true;
              }
            });
            checkComplete();
          };
          storeTransaction.onerror = () => {
            result.forEach(item => {
              if (item.key === deleteKey) {
                item.isDeleteSuccess = false;
              }
            });
            checkComplete();
          };
        }
      };
      request.onerror = (event) => {
        onError(event);
        db?.close();
      };
      request.onupgradeneeded = (event) => {
        console.log('@onupgradeneeded', event);
        this.onUpgradeneededCallback(event, dbName);
      };
      
      function checkComplete() {
        if (result.find(x => x.isDeleteSuccess === undefined) !== undefined) return;
        // complete!
        onSuccess(result);
        db.close();
      }
    };
  }

  clearStore(options: IIndexeddbManager.ClearStoreOptions<DBNAME, STORENAME>) {
    if (!this.isAbleIndexeddb) {
      console.error(`indexed db 가 지원되지 않습니다.`);
      return;
    }

    const {
      dbName,
      version,
      storeName,
      onSuccess,
      onError,
    } = options;

    this.isExistStore(dbName, version, storeName, (isExist) => {
      if (!isExist) {
        onError();
      } else {
        call();
      }
    });

    const call = () => {
      let db: IDBDatabase;
      const request = indexedDB.open(dbName, version);
      request.onsuccess = (event) => {
        db = (event.target as any).result;
        const store = db.transaction([storeName], 'readwrite').objectStore(storeName);
        const storeRequest = store.clear();
        storeRequest.onsuccess = (event) => {
          onSuccess(event);
          db?.close();
        };
        storeRequest.onerror = (event) => {
          onError();
          db?.close();
        };
      };
      request.onerror = (event) => {
        onError(event);
        db?.close();
      };
      request.onupgradeneeded = (event) => {
        console.log('@onupgradeneeded', event);
        this.onUpgradeneededCallback(event, dbName);
      };
    };
  }

  getFromStore<T extends { key: string } & Partial<{ createdAt: number; updatedAt: number }>>(options: IIndexeddbManager.GetOptions<T, DBNAME, STORENAME>) {
    const {
      dbName,
      version,
      storeName,
      keys,
      onResult,
      onError,
    } = options;

    this.isExistStore(dbName, version, storeName, (isExist) => {
      if (!isExist) {
        onError();
      } else {
        call();
      }
    });

    const call = () => {
      let db: IDBDatabase;
      const result: IIndexeddbManager.GetResult<T & { key: string } & Partial<{ createdAt: number; updatedAt: number }>>[] = keys.map(x => ({ key: x, data: null, isGetSuccess: null }));
      const request = indexedDB.open(dbName, version);
      request.onsuccess = (event) => {
        db = (event.target as any).result;
        const store = db.transaction([storeName], 'readonly').objectStore(storeName);
        for (const key of keys) {
          const storeRequest = store.get(key);
          storeRequest.onsuccess = () => {
            result.forEach((thisItem) => {
              if (thisItem.key === key) {
                thisItem.isGetSuccess = true;
                thisItem.data = storeRequest.result;
              }
            });
            checkComplete();
          };
          storeRequest.onerror = () => {
            result.forEach((thisItem) => {
              if (thisItem.key === key) {
                thisItem.isGetSuccess = false;
              }
            });
            checkComplete();
          };
        }
      };
      request.onerror = (event) => {
        onError(event);
        db?.close();
      };
      request.onupgradeneeded = (event) => {
        console.log('@onupgradeneeded', event);
        this.onUpgradeneededCallback(event, dbName);
      };

      function checkComplete() {
        if (result.find(x => x.isGetSuccess === null) !== undefined) {
          return;
        }
        onResult(result);
        db?.close();
      }
    };
  }

  getAllFromStore<T extends { key: string } & Partial<{ createdAt: number; updatedAt: number }>>(options: IIndexeddbManager.GetAllOptions<T, DBNAME, STORENAME>) {
    const {
      dbName,
      version,
      storeName,
      onResult,
      onError,
    } = options;

    this.isExistStore(dbName, version, storeName, (isExist) => {
      if (!isExist) {
        onError();
      } else {
        call();
      }
    });

    const call = () => {
      let db: IDBDatabase;
      // const result: IIndexeddbManager.GetResult<T & { key: string } & Partial<{ createdAt: number; updatedAt: number }>>[] = keys.map(x => ({ key: x, data: null, isGetSuccess: null }));
      const result: IIndexeddbManager.GetResult<T & { key: string } & Partial<{ createdAt: number; updatedAt: number }>>[] = [];
      const request = indexedDB.open(dbName, version);
      request.onsuccess = (event) => {
        db = (event.target as any).result;
        const store = db.transaction([storeName], 'readonly').objectStore(storeName);
        
        const storeRequest = store.getAll();
        storeRequest.onsuccess = () => {
          storeRequest.result.forEach((thisItem) => {
            result.push({
              key: thisItem.key,
              isGetSuccess: true,
              data: thisItem,
            });
          });
          checkComplete();
        };
        storeRequest.onerror = () => {
          onError(event);
        };
      };
      request.onerror = (event) => {
        onError(event);
        db?.close();
      };
      request.onupgradeneeded = (event) => {
        console.log('@onupgradeneeded', event);
        this.onUpgradeneededCallback(event, dbName);
      };

      function checkComplete() {
        if (result.find(x => x.isGetSuccess === null) !== undefined) {
          return;
        }
        onResult(result);
        db?.close();
      }
    };
  }

  isExistStore(dbName: string, version: number, storeName: string, onResult: (isExist: boolean) => void) {
    const request = indexedDB.open(dbName, version);
    request.onsuccess = (event) => {
      const db: IDBDatabase = (event.target as any).result;
      onResult(db.objectStoreNames.contains(storeName));
      db.close();
    };
    request.onupgradeneeded = (event) => {
      console.log('@onupgradeneeded', event);
      this.onUpgradeneededCallback(event, dbName);
    };
  }

  onUpgradeneededCallback(event: IDBVersionChangeEvent, dbName: string, onResult?: (defineStore: IIndexeddbManager.DefineStore<STORENAME>, isDefineSucess: boolean, isExist: boolean) => void, onEnd?: () => void) {
    console.log('@onupgradeneeded..', event);
    const schema = this.defineSchemas.find(x => x.dbName === dbName);
    if (schema === undefined) {
      console.error(`일치하는 schema 가 없습니다.`);
      return;
    }
    const db = (event.target as any).result;
    for (const defineStore of schema.defineStores) {
      if (!db.objectStoreNames.contains(defineStore.storeName)) {
        const store = db.createObjectStore(defineStore.storeName, { keyPath: defineStore.storekeyPath });
        defineStore.storeIndexItems?.forEach((storeIndexItem) => {
          store?.createIndex(storeIndexItem.indexName, storeIndexItem.keyPath, storeIndexItem.options);
        });
        if (typeof onResult === 'function') {
          onResult(defineStore, true, false);
        }
      } else {
        if (typeof onResult === 'function') {
          onResult(defineStore, false, true);
        }
      }
    }
    if (typeof onEnd === 'function') {
      onEnd();
    }
  }

  check_defineSchemas_isAbleIndexeddb() {
    if (this.isAbleIndexeddb !== true) {
      return;
    }

    if (this.isSchemasChecking) {
      return;
    }

    let callCheckCompleteCount = 0;
    this.isSchemasChecking = true;
    const result: IIndexeddbManager.DefineSchemaResults<DBNAME, STORENAME> = this.defineSchemas.map(x => ({ 
      dbName: x.dbName, 
      isDefineSuccess: null, 
      storeResult: x.defineStores.map(k => ({ 
        storeName: k.storeName,
        isDefineSuccess: null,
        isExist: null,
      })), 
    }));

    for (const schema of this.defineSchemas) {
      let db: IDBDatabase;
      const request = indexedDB.open(schema.dbName, schema.version);
      request.onerror = (event) => {
        result.forEach((thisItem) => {
          if (thisItem.dbName === schema.dbName) {
            thisItem.isDefineSuccess = false;
          }
        });
        checkComplete(db);
      };
      request.onsuccess = (event) => {
        checkComplete(db);
      };
      request.onupgradeneeded = (event) => {
        db = (event.target as any).result;
        this.onUpgradeneededCallback(event, schema.dbName, (defineStore, isDefineSucess, isExist) => {
          result.forEach((thisItem) => {
            if (thisItem.dbName === schema.dbName) {
              thisItem.storeResult.forEach((thisStoreItem) => {
                if (thisStoreItem.storeName === defineStore.storeName) {
                  thisStoreItem.isDefineSuccess = isDefineSucess;
                  thisStoreItem.isExist = isExist;
                }
              }); 
            }
          });
        }, () => {
          result.forEach((thisItem) => {
            if (thisItem.dbName === schema.dbName) {
              thisItem.isDefineSuccess = true;
            }
          });
        });
      };
    }

    const checkComplete = (db: IDBDatabase | undefined) => {
      db?.close();
      callCheckCompleteCount++;
      if (callCheckCompleteCount !== this.defineSchemas.length) return;
      
      this.isSchemasChecking = false;
      this.onDefineSchemasResult(result);
      this.isReady = true;
      if (typeof this.onChangeReady === 'function') {
        this.onChangeReady(this.isReady);
      }
      // setIsReady(true);
    }
  }
}