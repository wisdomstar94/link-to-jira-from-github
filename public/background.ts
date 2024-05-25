import { v4 } from "uuid";
import { defineSchemas, getDbVersion } from "../src/indexeddb/schema";
import { ISchema } from "../src/indexeddb/schema.interface";
import { IndexeddbManager } from "../src/utils/indexeddb-manager/indexeddb-manager.class";

const indexeddbManager = new IndexeddbManager(defineSchemas, (result) => {
  // ...
});

chrome.runtime.onInstalled.addListener(function(details) {
  if(details.reason === "install"){ // 첫 설치
    sendNotification('설치 완료','앱이 설치되었습니다.', 3000);
  }else if(details.reason === "update"){
    sendNotification('업데이트 완료','앱이 업데이트되었습니다.', 3000);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // sendResponse(request);

  switch (request.requestUrl) {
    case '/all_list': 
      (function(){
        indexeddbManager.getAllFromStore<ISchema.Data.GithubJiraSetupList>({
          dbName: 'github_to_jira',
          version: getDbVersion('github_to_jira'),
          storeName: 'github_jira_setup_list',
          onError(event) {
              
          },
          onResult(result) {
            const arr = result.filter(k => k !== null && k !== undefined).map(k => k.data!);
            const arr2 = [ ...arr ];
            arr2.sort(function(a, b) {
              return (b.createdAt ?? 0) - (a.createdAt ?? 0);
            });
            sendResponse({ data: arr2, isSuccess: true });
          },
        });
      })();
      break;
    case '/github_jira_setup_list_insert': 
      (function(){
        const {
          createGithubBaseUrl,
          createJiraBaseUrl,
        } = request;

        indexeddbManager.insertToStore<ISchema.Data.GithubJiraSetupList>({
          dbName: 'github_to_jira',
          version: getDbVersion('github_to_jira'),
          storeName: 'github_jira_setup_list',
          isOverwrite: true,
          datas: [
            { key: v4(), githubBaseUrl: createGithubBaseUrl, jiraBaseUrl: createJiraBaseUrl },
          ],
          onSuccess(result) {
            sendResponse({ data: result, isSuccess: true });
          },
          onError(event) {
            sendResponse({ data: event, isSuccess: false });
          },
        });
      })();
      break;
    case '/github_jira_setup_list_modify': 
      (function(){
        const {
          key,
          githubBaseUrl,
          jiraBaseUrl,
        } = request;

        indexeddbManager.insertToStore<ISchema.Data.GithubJiraSetupList>({
          dbName: 'github_to_jira',
          version: getDbVersion('github_to_jira'),
          storeName: 'github_jira_setup_list',
          isOverwrite: true,
          datas: [
            { key, githubBaseUrl, jiraBaseUrl },
          ],
          onSuccess(result) {
            sendResponse({ data: result, isSuccess: true });
          },
          onError(event) {
            sendResponse({ data: event, isSuccess: false });
          },
        });
      })();
      break;
    case '/github_jira_setup_list_delete': 
      (function(){
        const {
          keys,
        } = request;

        indexeddbManager.deletesToStore({
          dbName: 'github_to_jira',
          version: getDbVersion('github_to_jira'),
          storeName: 'github_jira_setup_list',
          onError(event) {
            sendResponse({ data: event, isSuccess: false });
          },
          onSuccess(result) {
            sendResponse({ data: result, isSuccess: true });
          },
          deleteKeys: keys,
        });
      })();
      break;
  }
  return true;
});

function sendNotification(notiId: string, msg: string, dwellingTimeMs: number) {
  //clear noti for fast notification
  chrome.notifications.clear(notiId, () => {

  });

  chrome.notifications.create(notiId, {
    type: 'basic',
    title: notiId,
    iconUrl: "icon128.png",
    message: msg,
    priority: 2, // -2 to 2 (highest)
  
    // buttons: [
    //     {
    //         title: '저장'
    //     },
    //     {
    //         title: '취소'
    //     }
    // ],
  
    eventTime: Date.now()
  });
  
  setTimeout(() => {
    chrome.notifications.clear(notiId, () => {

    });
  }, dwellingTimeMs);
}