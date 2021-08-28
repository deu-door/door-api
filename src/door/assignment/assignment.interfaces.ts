import { Attachment } from '../common/attachment.interfaces';
import { Course } from '../course/course.interfaces';
import { Activity, ActivityHead } from './activity.interfaces';
import { Homework, HomeworkHead } from './homework.interfaces';
import { TeamProject, TeamProjectHead } from './team_project.interfaces';

/**
 * 과제 종류를 나타내는 상수 enum
 */
export enum AssignmentVariant {
	HOMEWORK = 'Homework',
	TEAM_PROJECT = 'TeamProject',
	ACTIVITY = 'Activity',
}

export enum AssignmentType {
	INDIVIDUAL = '개인과제',
	TEAM = '팀별과제',
}

/**
 * 모든 과제 종류를 모아놓은 배열
 */
export const AssignmentVariants = [AssignmentVariant.HOMEWORK, AssignmentVariant.TEAM_PROJECT] as const;

/**
 * AssignmentVariant에 대응되는 이름
 */
export const AssignmentVariantNames = {
	[AssignmentVariant.HOMEWORK]: '과제',
	[AssignmentVariant.TEAM_PROJECT]: '팀 프로젝트',
	[AssignmentVariant.ACTIVITY]: '수업활동일지',
} as const;

/**
 * 과제 Union 타입
 */
export type Assignment = Homework | TeamProject | Activity;
export type AssignmentHead = HomeworkHead | TeamProjectHead | ActivityHead;

/**
 * List view에서 각 Assignment에 대해 표시되는 최소한의 정보들
 */
export type BaseAssignmentHead = Pick<BaseAssignment, 'variant' | 'courseId' | 'id' | 'title' | 'type' | 'duration' | 'submitted'> & {
	partial: true;
};

/**
 * 과제 인터페이스
 */
export interface BaseAssignment {
	/**
	 * 과제의 종류
	 *
	 * @see {AssignmentVariant}
	 */
	readonly variant: AssignmentVariant;
	/**
	 * 일부인지, 아닌지 여부 (AssignmentHead vs Assignment)
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
	 * 과제유형 (예: 개인과제)
	 */
	type: AssignmentType;
	/**
	 * 제출 기간
	 */
	duration: {
		from: string;
		to: string;
	};
	/**
	 * 추가로 주어진 기한
	 */
	additionalDuration?: {
		from: string;
		to: string;
	};
	/**
	 * 게시물 내용
	 */
	contents: string;
	/**
	 * 게시물 첨부파일
	 */
	attachments: Attachment[];
	/**
	 * 제출 여부
	 */
	submitted: boolean;
	/**
	 * 제출 내용 (undefined는 미제출)
	 */
	submission: Submission;
}

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
