// import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { ISchema } from "../indexeddb/schema.interface";

const githubBaseUrlPlaceholder = 'ex) https://github.com/companyname';
const jiraBaseUrlPlaceholder = 'ex) https://companyname.atlassian.net';

export function IndexPage() {
  const [displayedList, setDisplayedList] = useState<Array<ISchema.Data.GithubJiraSetupList>>();
  const [createGithubBaseUrl, setCreateGithubBaseUrl] = useState('');
  const [createJiraBaseUrl, setCreateJiraBaseUrl] = useState('');

  function addButtonClick() {
    if (createGithubBaseUrl.trim() === '') {
      alert('Please enter github base url.');
      return;
    }

    if (createJiraBaseUrl.trim() === '') {
      alert('Please enter jira base url.');
      return;
    }

    chrome.runtime.sendMessage({ requestUrl: '/github_jira_setup_list_insert', createGithubBaseUrl, createJiraBaseUrl }, (response) => {
      if (response.isSuccess === true) {
        refreshList();
        setCreateGithubBaseUrl('');
        setCreateJiraBaseUrl('');
      }
    });
  }

  function refreshList() {
    chrome.runtime.sendMessage({ requestUrl: '/all_list', createGithubBaseUrl, createJiraBaseUrl }, (response) => {
      // console.log('@@@ /all_list response', response);
      setDisplayedList(response.data);
      // if (response.isSuccess === true) {
      //   refreshList();
      // }
    });
  }

  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // const navigate = useNavigate();

  return (
    <>
      {/* index!
      <button onClick={() => {
        navigate('/test');
      }}>go to test</button> */}
      <div className="w-full bg-blue-500 box-border px-4 py-2 text-white text-base text-center">
        setup
      </div>
      <div className="w-full relative box-border p-4">
        <ul className="w-full relative flex flex-wrap gap-4">
          {
            displayedList?.map((k, index) => {
              return (
                <li key={k.key} className="w-full relative flex flex-nowrap gap-2 justify-start items-center border border-gray-400 box-border p-3 text-sm">
                  <div className="text-xs bg-black text-white inline-flex px-2 py-0.5 flex-wrap justify-center items-center absolute -top-2.5 -left-2 rounded-full z-10">
                    {/* uid : { k.key } */}
                    { displayedList.length - index }
                  </div>
                  <div className="w-full flex flex-wrap relative gap-1">
                    <div className="w-full relative flex flex-nowrap gap-1 items-center">
                      <span className="w-[110px] flex-shrink-0">github base url : </span>
                      <input type="text" className="w-full border border-slate-200 box-border bg-white rounded-sm px-2.5 py-1.5" value={k.githubBaseUrl} placeholder={githubBaseUrlPlaceholder} onChange={(e) => {
                        setDisplayedList(prev => prev?.map(item => {
                          if (item.key !== k.key) return item;
                          const newItem = { ...item };
                          newItem.githubBaseUrl = e.target.value;
                          return newItem;
                        }));
                      }} />
                    </div>
                    <div className="w-full relative flex flex-nowrap gap-1 items-center">
                      <span className="w-[110px] flex-shrink-0">jira base url : </span>
                      <input type="text" className="w-full border border-slate-200 box-border bg-white rounded-sm px-2.5 py-1.5" value={k.jiraBaseUrl} placeholder={jiraBaseUrlPlaceholder} onChange={(e) => {
                        setDisplayedList(prev => prev?.map(item => {
                          if (item.key !== k.key) return item;
                          const newItem = { ...item };
                          newItem.jiraBaseUrl = e.target.value;
                          return newItem;
                        }));
                      }} />
                    </div>
                  </div>
                  <div className="w-[80px] relative flex-shrink-0 flex flex-wrap gap-1">
                    <button
                      className="flex w-full flex-wrap justify-center items-center box-border px-3 py-1.5 bg-blue-500 hover:bg-blue-700 text-white cursor-pointer"
                      onClick={() => {
                        if (!window.confirm('Are you sure you want to modify it?')) return;

                        chrome.runtime.sendMessage({ requestUrl: '/github_jira_setup_list_modify', key: k.key, githubBaseUrl: k.githubBaseUrl, jiraBaseUrl: k.jiraBaseUrl }, (response) => {
                          refreshList();
                        });
                      }}
                      >
                      modify
                    </button>
                    <button
                      className="flex w-full flex-wrap justify-center items-center box-border px-3 py-1.5 bg-red-500 hover:bg-red-700 text-white cursor-pointer"
                      onClick={() => {
                        if (!window.confirm('Are you sure you want to delete it?')) return;

                        chrome.runtime.sendMessage({ requestUrl: '/github_jira_setup_list_delete', keys: [k.key] }, (response) => {
                          refreshList();
                        });
                        // indexeddbManager.deletesToStore({
                        //   dbName: 'github_to_jira',
                        //   version: getDbVersion('github_to_jira'),
                        //   storeName: 'github_jira_setup_list',
                        //   onError(event) {

                        //   },
                        //   onSuccess(result) {
                        //     refreshList();
                        //   },
                        //   deleteKeys: [k.key],
                        // });
                      }}
                      >
                      delete
                    </button>
                  </div>
                </li>
              )
            })
          }
          <li key={'create-row'} className="w-full relative flex flex-nowrap gap-2 justify-start items-center border border-dashed border-gray-200 box-border p-2 text-sm">
            <div className="w-full flex flex-wrap relative gap-1">
              <div className="w-full relative flex flex-nowrap gap-1 items-center">
                <span className="w-[110px] flex-shrink-0">github base url : </span>
                <input type="text" className="w-full border border-slate-200 box-border bg-white rounded-sm px-2.5 py-1.5" value={createGithubBaseUrl} placeholder={githubBaseUrlPlaceholder} onChange={(e) => {
                  setCreateGithubBaseUrl(prev => e.target.value);
                }} />
              </div>
              <div className="w-full relative flex flex-nowrap gap-1 items-center">
                <span className="w-[110px] flex-shrink-0">jira base url : </span>
                <input type="text" className="w-full border border-slate-200 box-border bg-white rounded-sm px-2.5 py-1.5" value={createJiraBaseUrl} placeholder={jiraBaseUrlPlaceholder} onChange={(e) => {
                  setCreateJiraBaseUrl(prev => e.target.value);
                }} />
              </div>
            </div>
            <div className="w-[80px] relative flex-shrink-0 flex flex-wrap gap-1">
              <button
                className="flex w-full flex-wrap justify-center items-center box-border px-3 py-1.5 bg-purple-500 hover:bg-purple-700 text-white cursor-pointer"
                onClick={addButtonClick}
                >
                add
              </button>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}