import { ISchema } from "../../src/indexeddb/schema.interface";

(async() => {
  chrome.runtime.sendMessage({ requestUrl: '/all_list' }, (response) => {
    const items: ISchema.Data.GithubJiraSetupList[] = response.data;
    const fullUrl = window.location.href;
    const targetItem = items.find(x => fullUrl.startsWith(x.githubBaseUrl));
    if (targetItem === undefined) return;
    checkPrDetailPage(targetItem);
    checkCommitDetailPage(targetItem);
  });
})();

function checkPrDetailPage(targetItem: ISchema.Data.GithubJiraSetupList) {
  const titleElement = document.querySelector('.js-issue-title');
  if (titleElement === null) return;
  
  const html = titleElement.innerHTML;
  
  const regex = /\[.*?\]/;
  const matchedTicketStrings = html.match(regex) ?? [];
  const matchedTicketString = matchedTicketStrings[0];
  if (matchedTicketString === undefined) return;

  const onlyTicketCode = matchedTicketString.replace('[', '').replace(']', '');
  const newHTML = html.replace(matchedTicketString, `<a class="jira-ticket-a" href="${targetItem.jiraBaseUrl}/browse/${onlyTicketCode}" target="_blank">${matchedTicketString}</a>`);
  titleElement.innerHTML = newHTML;  
}

function checkCommitDetailPage(targetItem: ISchema.Data.GithubJiraSetupList) {
  const titleElement = document.querySelector('.commit-title');
  if (titleElement === null) return;
  
  const html = titleElement.innerHTML;
  
  const regex = /\[.*?\]/;
  const matchedTicketStrings = html.match(regex) ?? [];
  const matchedTicketString = matchedTicketStrings[0];
  if (matchedTicketString === undefined) return;

  const onlyTicketCode = matchedTicketString.replace('[', '').replace(']', '');
  const newHTML = html.replace(matchedTicketString, `<a class="jira-ticket-a" href="${targetItem.jiraBaseUrl}/browse/${onlyTicketCode}" target="_blank">${matchedTicketString}</a>`);
  titleElement.innerHTML = newHTML;
}
