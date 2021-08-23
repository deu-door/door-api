import { Course } from '../course/course.interfaces';

export type LectureType = '시험' | '강의' | '공지' | '출제' | '휴강' | '대면' | '미등록' | '다운로드';

export type LectureAttendance = '미수강' | '완료전' | '출석' | '결석' | '지각';

export interface Lecture {
	/**
	 * Course ID
	 */
	courseId: Course['id'];
	/**
	 * 강의 주제 (예: 데이터활용프로그래밍 수업 안내)
	 */
	title: string;
	/**
	 * 강의 형태 (강의/대면) (예: 강의)
	 */
	type: LectureType;
	/**
	 * 주차
	 */
	week: number;
	/**
	 * 차시
	 */
	period: number;
	/**
	 * 강의 기간
	 */
	duration: {
		from: string;
		to: string;
	};
	/**
	 * 학습시간(분) (예: 24)
	 */
	length: number;
	/**
	 * 출결 상태 (미수강/완료전/출석/결석) (예: 완료전)
	 */
	attendance: LectureAttendance | undefined;
	/**
	 * 강의 학습현황
	 */
	progress?: LectureProgress;
	/**
	 * 강의로 이동하는 링크. 없을 수도 있음 (미업로드)
	 */
	url?: string;
}

export interface LectureProgress {
	/**
	 * 수업의 형태. 온라인 또는 오프라인
	 */
	//type: '온라인' | '오프라인';
	/**
	 * 최종 학습시간
	 */
	length: number;
	/**
	 * 진행중인 학습시간
	 */
	current: number;
	/**
	 * 강의 접속 수
	 */
	views: number;
	/**
	 * 최초 학습일
	 */
	startedAt?: string;
	/**
	 * 학습 완료일
	 */
	finishedAt?: string;
	/**
	 * 최근 학습일
	 */
	recentViewedAt?: string;
}
