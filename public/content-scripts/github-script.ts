import { ISchema } from "../../src/indexeddb/schema.interface";
import { DomObserver } from "../../src/utils/dom-observer/dom-observer.class";

const domObserver = new DomObserver("head", {
  childList: true,
  subtree: true,
});

const domObserver2 = new DomObserver("#js-global-screen-reader-notice", {
  childList: true,
  subtree: true,
});

(async () => {
  chrome.runtime.sendMessage({ requestUrl: "/all_list" }, (response) => {
    const items: ISchema.Data.GithubJiraSetupList[] = response.data;
    const fullUrl = window.location.href;
    const targetItem = items.find((x) => fullUrl.startsWith(x.githubBaseUrl));
    if (targetItem === undefined) return;
    checkPrDetailPage(targetItem);
    checkCommitDetailPage(targetItem);
  });
})();

function checkPrDetailPage(targetItem: ISchema.Data.GithubJiraSetupList) {
  domObserver.setCallback((mutations) => {
    setTimeout(() => {
      dispose();
    }, 200);
  });

  domObserver2.setCallback((mutations) => {
    setTimeout(() => {
      dispose();
    }, 200);
  });

  function dispose() {
    const titleElement = document.querySelector(".gh-header-title");
    // console.log('@titleElement', titleElement);

    // titleElements.forEach((titleElement) => {
    if (titleElement === null) return;
    const is_ltjfg_changed = titleElement.getAttribute("data-is-ltjfg-changed");
    if (is_ltjfg_changed === "true") {
      // console.log('already applied');
      return;
    }

    const html = titleElement.innerHTML;

    const regex = /\[.*?\]/;
    const matchedTicketStrings = html.match(regex) ?? [];
    const matchedTicketString = matchedTicketStrings[0];
    if (matchedTicketString === undefined) return;

    const onlyTicketCode = matchedTicketString
      .replace("[", "")
      .replace("]", "");
    const newHTML = html.replace(
      matchedTicketString,
      `<a class="jira-ticket-a" href="${targetItem.jiraBaseUrl}/browse/${onlyTicketCode}" target="_blank">${matchedTicketString}</a>`
    );
    titleElement.innerHTML = newHTML;
    titleElement.setAttribute("data-is-ltjfg-changed", "true");
    // });
  }
  dispose();
}

function checkCommitDetailPage(targetItem: ISchema.Data.GithubJiraSetupList) {
  domObserver.setCallback((mutations) => {
    dispose();
  });

  function dispose() {
    const titleElement = document.querySelector(".commit-title");
    if (titleElement === null) return;
    const is_ltjfg_changed = titleElement.getAttribute("data-is-ltjfg-changed");
    if (is_ltjfg_changed === "true") {
      // console.log('already applied');
      return;
    }

    const html = titleElement.innerHTML;

    const regex = /\[.*?\]/;
    const matchedTicketStrings = html.match(regex) ?? [];
    const matchedTicketString = matchedTicketStrings[0];
    if (matchedTicketString === undefined) return;

    const onlyTicketCode = matchedTicketString!
      .replace("[", "")
      .replace("]", "");
    const newHTML = html.replace(
      matchedTicketString!,
      `<a class="jira-ticket-a" href="${targetItem.jiraBaseUrl}/browse/${onlyTicketCode}" target="_blank">${matchedTicketString}</a>`
    );
    titleElement!.innerHTML = newHTML;
    titleElement.setAttribute("data-is-ltjfg-changed", "true");
  }

  dispose();
}
