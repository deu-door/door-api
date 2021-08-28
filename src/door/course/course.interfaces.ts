import { Term } from '../term/term.interfaces';

/**
 * 강의에 대한 정보를 얻을 수 있습니다.
 */
export interface Course {
	/**
	 * 홈페이지 URL을 통해 접근할 때 사용하는 자원 ID
	 * door.deu.ac.kr/LMS/LectureRoom/Main/{ID}
	 */
	readonly id: string;
	/**
	 * 강의에 해당되는 학기(term)의 ID
	 */
	termId: Term['id'];
	/**
	 * 교과목 (예: ICT융합기술론)
	 */
	name: string;
	/**
	 * 구분 (예: 전공필수, 전공선택)
	 */
	type: string;
	/**
	 * 담당교수 (예: 홍길동)
	 */
	professor: string;
	/**
	 * 분반 (예: 5)
	 */
	division: string;
	/**
	 * 수업 계획서
	 */
	syllabus?: CourseSyllabus;
}

/**
 * 수업 계획서 내용, 추가적인 fetch로 얻을 수 있음
 */
export interface CourseSyllabus {
	/**
	 * 강의 ID
	 */
	readonly id: string;
	/**
	 * 주관학과 (예: 컴퓨터공학과)
	 */
	major: string;
	/**
	 * 대상학년 (예: 2 (2학년))
	 */
	target: number;
	/**
	 * 학점 (예: 3.00)
	 */
	credits: number;
	/**
	 * 시간 (예: 4)
	 */
	hours: number;
	/**
	 * 교수 연락처 (예: 051-000-0000)
	 */
	contact: string;
	/**
	 * 교수 이메일 (예: example@deu.ac.kr)
	 */
	email: string;
	/**
	 * 교과목 개요 (예: 컴퓨터 프로그래밍이란 프로그램을 작성하는 것을 말한다. ...)
	 */
	description: string;
	/**
	 * 교과목 교육목표 (예: 컴퓨터 프로그래밍의 정의를 이해하고, 프로그램 설계 과정의 기초에 대해 학습한다.)
	 */
	goal: string;
	/**
	 * 강의실 및 시간 (예: 정보810[월5-6], 정보810[수5])
	 */
	times: CourseTime[];
	/**
	 * 주교재 (예: C언어 스케치)
	 */
	book: string;
	/**
	 * 수업 평가 방법 (비율)
	 */
	rateInfo: CourseRateInfo;
	/**
	 * 주차별 강의계획
	 */
	weeks: CourseWeekSchedule[];
}

/**
 * 강의실 및 시간 (예: 정보810[월5-6])
 *
 * @example
 * ```
 * {
 *   room: "정보810",
 *   day: "월",
 *   times: [1, 2]
 * }
 * ```
 */
export interface CourseTime {
	/**
	 * 강의실 (예: 정보810)
	 */
	room: string;
	/**
	 * 요일 (예: 월)
	 */
	day: string;
	/**
	 * 시간 (예: [1, 2] (1교시, 2교시)
	 */
	times: number[];
}

export type CourseRateMethods =
	| '중간고사'
	| '기말고사'
	| '퀴즈'
	| '과제'
	| '팀PJ'
	| '출석'
	| '기타1'
	| '기타2'
	| '기타3'
	| '발표'
	| '참여도';

export type CourseRateInfo = Record<CourseRateMethods, number>;

export interface CourseWeekSchedule {
	/**
	 * 주차 (예: 3)
	 */
	week: string;
	/**
	 * 주차에 해당되는 날짜 (부터~) (예: 2020-11-03)
	 */
	from: Date;
	/**
	 * 주차에 해당되는 날짜 (~까지)
	 */
	to: Date;
	/**
	 * 강의내용 (예: 9장 변수 유효범위와 함수 활용(1))
	 */
	contents?: string;
	/**
	 * 과제/비고 (예: 프로그램 수시 평가 / 1차 과제 제출)
	 */
	remark?: string;
}
