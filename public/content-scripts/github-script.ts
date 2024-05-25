// const div = document.createElement('div');
// div.innerText = '하이욤';
// div.style.position = 'fixed';
// div.style.top = '0';
// div.style.left = '0';
// div.style.backgroundColor = '#fff';
// div.style.zIndex = '9999';

import { ISchema } from "../../src/indexeddb/schema.interface";

// document.body.appendChild(div);

(async() => {
  // console.log('@request /all_list');
  chrome.runtime.sendMessage({ requestUrl: '/all_list' }, (response) => {
    // console.log('@response', response);
    const items: ISchema.Data.GithubJiraSetupList[] = response.data;
    // console.log('@items', items);

    // console.log('window.location.pathname', window.location.pathname);
    const fullUrl = window.location.href;
    const targetItem = items.find(x => fullUrl.startsWith(x.githubBaseUrl));
    if (targetItem === undefined) return;
    checkPrPage(targetItem);
  });
})();

function checkPrPage(targetItem: ISchema.Data.GithubJiraSetupList) {
  const titleElement = document.querySelector('.js-issue-title');
  if (titleElement !== null) {
    const html = titleElement.innerHTML;
    // console.log('@html', html);
    const regex = /\[.*?\]/;
    const matchedTicketStrings = html.match(regex) ?? [];
    const matchedTicketString = matchedTicketStrings[0];
    if (matchedTicketString !== undefined) {
      const onlyTicketCode = matchedTicketString.replace('[', '').replace(']', '');
      const newHTML = html.replace(matchedTicketString, `<a href="${targetItem.jiraBaseUrl}/browse/${onlyTicketCode}" target="_blank">${matchedTicketString}</a>`);
      titleElement.innerHTML = newHTML;
    }
  }
}
