# hypercloud-console_5.0.85.0 Patch Note

Version Info: 5.0.85.0 ([ major ].[ minor ].[ patch ].[ hotfix ])
Released Time: 2022-12-01 10:51:23

- 2022-11-25 [bugfix][IMS 294263]헬름 리포지터리 상세페이지 차트 탭 무한로딩 수정 (by Hyowook Park) 
- 2022-11-28 [feat][IMS 294273] 헬름차트 메뉴에서 이름 중복 리소스 가져오지 않는 현상 수정 (by inth9198) 
- 2022-11-28 [feat][IMS 294562] defaultSelectedRows 사용 안하게 하고 href 수정, ingress path 의 service port 참조 변경 (by Hyowook Park) 
- 2022-11-28 [feat][IMS 294562] defaultSelectedRows 사용 안하게 하고 href 수정, ingress path 의 service port 참조 변경 (by Hyowook Park) 
- 2022-11-29 [feat][IMS 290316] 콘솔 시크릿 정보 표시 관련 ui 재적용 및 수정시 다른 값이 영향받는 현상 수정 (by inth9198) 
- 2022-11-29 [feat][IMS 294550] 싱글클러스터 콘솔 잔여 이슈 수정 (by inth9198) 
- 2022-11-30 [feat][IMS 294302] HPA메트릭 수치 표시가 안되는 문제 수정 (by inth9198) 
- 2022-11-30 [feat][IMS 294550] 싱글클러스터 콘솔 잔여 이슈 수정 (by jinsoo_youn) 
    Note: - 5. kubeconfig.file 다운로드 클릭 시 오류
- window.SERVER_FLAGS.kubeAPIServerURL 추가
- 콘솔 기동 시 app.kubeAPIServerURL="kubeapiURL"입력 필요
- 미입력시 https://kubernetes.default.svc 로 설정

- 2022-12-01 [feat][IMS 294550] 싱글클러스터 콘솔 잔여 이슈 수정 - event page, service page (by Hyowook Park) 
