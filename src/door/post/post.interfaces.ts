import { Attachment } from '../common/attachment.interfaces';
import { Course } from '../course/course.interfaces';
import { NoticePost, NoticePostHead } from './notice_post.interfaces';
import { ReferencePost, ReferencePostHead } from './reference_post.interfaces';

/**
 * 포스트 종류를 나타내는 상수 enum
 */
export enum PostVariant {
	NOTICE = 'Notice',
	REFERENCE = 'Reference',
	//QA = 'QA',
	//COUNSEL = 'Counsel',
	//TEAM = 'Team',
	//MENTORING = 'Mentoring',
}

/**
 * 모든 포스트 종류를 모아놓은 배열
 */
export const PostVariants = [
	PostVariant.NOTICE,
	PostVariant.REFERENCE,
	//PostVariant.QA,
	//PostVariant.COUNSEL,
	//PostVariant.TEAM,
	//PostVariant.MENTORING,
] as const;

/**
 * PostVariant의 이름
 */
export const PostVariantNames = {
	[PostVariant.NOTICE]: '공지사항',
	[PostVariant.REFERENCE]: '강의자료',
} as const;

/**
 * 게시물 Union 타입
 */
export type PostHead = NoticePostHead | ReferencePostHead;
export type Post = NoticePost | ReferencePost;

/**
 * List view에서 각 Post에 대해 표시되는 최소한의 정보들
 */
export type BasePostHead = Pick<BasePost, 'variant' | 'courseId' | 'id' | 'title' | 'createdAt' | 'noted' | 'author' | 'views'> & {
	partial: true;
};

/**
 * 게시물 인터페이스. 상속에 사용됨
 */
export interface BasePost {
	/**
	 * 게시물의 종류
	 *
	 * @see {PostVariant}
	 */
	readonly variant: PostVariant;
	/**
	 * 게시물의 일부인지, 아닌지 여부 (BasePost vs BasePostHead)
	 */
	partial: false;
	/**
	 * 게시물에 해당되는 @see {Course} 의 id
	 */
	readonly courseId: Course['id'];
	/**
	 * 게시물 id
	 */
	readonly id: string;
	/**
	 * 게시물의 제목
	 */
	title: string;
	/**
	 * 게시물 등록일 (타임스탬프) (예: 2021-03-01T17:30:00Z)
	 */
	createdAt: string;
	/**
	 * 읽음 여부
	 */
	noted: boolean;
	/**
	 * 공지사항의 작성자
	 */
	author: string;
	/**
	 * 조회수
	 */
	views: number;
	/**
	 * 게시물 내용
	 */
	contents: string;
	/**
	 * 게시물 첨부파일
	 */
	attachments: Attachment[];
}
