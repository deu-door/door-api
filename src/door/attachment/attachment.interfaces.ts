export interface Attachment {
	/**
	 * 첨부파일 이름
	 */
	title: string;
	/**
	 * 첨부파일 링크
	 */
	url: string;
	/**
	 * 첨부파일을 다운로드하기 위해 참조하였던 링크
	 *
	 * Door 시스템의 패치로 인해 이 값을 HTTP Header에 Referer로 설정하여야 함
	 */
	referrer: string;
}
