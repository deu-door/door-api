import { Attachment } from '../../attachment/attachment.interfaces';

/**
 * 제출 정보를 나타내는 인터페이스
 */

export interface Submission {
	/**
	 * 제출 내용 (예: 금일 진행한 조별과제 회의록)
	 */
	contents: string;
	/**
	 * 첨부파일
	 */
	attachments: Attachment[];
}
