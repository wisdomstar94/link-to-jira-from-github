# link-to-jira-from-github

github 에서 jira 로 연결하는 기능을 제공하는 크롬 확장프로그램 입니다.

<br />

# 적용 방법
1. chrome 을 열고 주소창에 `chrome://extensions/` 을 입력합니다.
2. 상단 우측에 있는 "개발자 모드" 를 활성화 합니다.
3. [link-to-jira-from-github 최신버전 릴리즈 페이지](https://github.com/wisdomstar94/link-to-jira-from-github/releases/latest)의 Assets 부분에서 `link_to_jira_from_github_v버전명.zip` 압축 파일을 다운로드 받습니다.
4. 다운로드 받은 압축 파일을 압축 해제하면 폴더가 하나 나옵니다.
5. 다시 chrome 의 `chrome://extensions/` 화면으로 돌아와서 상단의 `압축해제된 확장 프로그램을 로드합니다.` 버튼을 클릭 후 아까 압축 해제 후 나온 폴더를 선택합니다.
6. 확장 프로그램이 등록 된 후 주소창 우측에 있는 확장프로그램 아이콘을 클릭 후 방금 등록한 `Link To Jira From Github` 확장 프로그램을 클릭합니다.
7. Setup 팝업 창이 표시될텐데, 서로 연동하고자 하는 github base url 과 jira base url 을 입력 후 add 버튼을 눌러 정보를 등록해줍니다.
8. github 사이트에 접속하면 이제 Pull Request 의 상세페이지나 Commit 상세페이지의 Title 부분에 jira ticket 문자가 존재하면 해당 문자에 jira 링크가 할당되며 클릭시 해당 jira ticket 상세 페이지가 새창으로 열립니다.