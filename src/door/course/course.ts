import assert from 'assert';
import { Door } from '..';
import { parseInformaticTableElement, parseListedTableElement } from '../helper/table';
import { Term } from '../term/term.interfaces';
import { Course, CourseRateInfo, CourseSyllabus, CourseTime } from './course.interfaces';

const getCourseTypeWeight = (word: string) =>
	// calculate cost (sort priority) of type
	(word.includes('전공') ? 2 : -2) +
	(word.includes('필수') ? 1 : 0) +
	(word.includes('선택') ? -1 : 0) +
	(word.includes('교양') ? 1 : -1) +
	(word.includes('공통') ? -1 : 0);

const sortByCourseType = (a: Course, b: Course): number => getCourseTypeWeight(a.type) - getCourseTypeWeight(b.type);

export async function getCourseList(door: Door, termId: Term['id']): Promise<Course[]> {
	const { document, HTMLTableElement } = await door.get(`/MyPage${termId !== undefined ? `?termNo=${termId}` : ''}`);
	const courseTable = document.querySelector('#wrap table');

	assert(courseTable instanceof HTMLTableElement);

	// Schema of Course table is:
	/**
	 * @example
	 * ```
	 * {
	 *   강의실: "",
	 *   강의형태: "오프라인",
	 *   교과목: "컴퓨터적사고키우기",
	 *   구분: "균형교양",
	 *   담당교수: "홍길동",
	 *   분반: "1",
	 *   진도율: "0/13",
	 *   학기: "2020 / 2"
	 * }
	 * ```
	 */
	const courses = parseListedTableElement(courseTable)
		.map(course => {
			return {
				termId,
				// javascript:goRoom('36190', 'CHGB001')
				id: course['교과목']?.url?.match(/goRoom\('(\w+)', ?'\w+'\)/)?.[1] || '',
				name: course['교과목'].text,
				type: course['구분'].text,
				professor: course['담당교수'].text,
				division: course['분반'].text,
			};
		})
		.filter(course => course.id !== '')
		.sort(sortByCourseType);

	return courses;
}

/**
 * @param prevCourse Course.id 기반으로 구체적인 정보를 얻습니다.
 *
 * @returns 인자로 주어진 Course의 id와 Course의 추가 정보를 반환합니다.
 */
export async function getCourseSyllabus(door: Door, courseId: string): Promise<CourseSyllabus> {
	const { document, HTMLTableElement } = await door.get(`/LMS/LectureRoom/CourseLetureDetail/${courseId}`);

	// 수업계획 (수업계획서), 수업평가방법 (수업계획서)
	const [descriptionTable, ratesTable] = document.querySelectorAll('table.tbl_type_01');

	// 주차별 강의계획
	const scheduleTable = document.querySelector('table.tbl_type');

	assert(
		descriptionTable instanceof HTMLTableElement && ratesTable instanceof HTMLTableElement && scheduleTable instanceof HTMLTableElement,
	);

	const description = parseInformaticTableElement(descriptionTable);

	const rates = parseListedTableElement(ratesTable).find(row => row['평가항목'].text === '비율') ?? {};

	//const schedule = parseTableElement(scheduleTable);

	return {
		id: courseId,

		//name: description['교과목명'].text,
		// NOTE: Door 메인에서 이수구분과 수업계획서의 이수구분이 다를 수 있음
		// type: description['이수구분'].text,
		major: description['주관학과'].text,
		target: parseInt(description['대상학년'].text),
		credits: Number(description['학점/시간'].text.split('/')[0].trim()),
		hours: Number(description['학점/시간'].text.split('/')[1].trim()),
		//professor: description['담당교원'].text,
		contact: description['연락처/이메일'].text.split('/')[0].trim(),
		email: description['연락처/이메일'].text.split('/')[1].trim(),
		description: description['교과목개요'].text,
		goal: description['교과 교육목표'].text,
		times: description['강의실(시간)'].text
			.split(',')
			.map(timeText => timeText.trim())
			.map(timeText => {
				const matches = timeText.match(/([가-힣\w]+)\[([월화수목금토일])(\d)(?:-(\d))?\]/);

				if (matches === null) return undefined;

				const start = Number(matches[3]);
				const end = Number(matches[4] ?? start);

				return {
					room: matches[1],
					day: matches[2],
					times: [...Array(end - start + 1).keys()].map(i => i + start),
				};
			})
			.filter((time): time is CourseTime => time !== undefined),

		book: description['주교재'].text,

		rateInfo: Object.fromEntries(
			['중간고사', '기말고사', '퀴즈', '과제', '팀PJ', '출석', '기타1', '기타2', '기타3', '발표', '참여도'].map(rateName => [
				rateName,
				Number(rates[rateName].text ?? 0),
			]),
		) as CourseRateInfo,

		// schedule: schedule ? Object.fromEntries(schedule.map(row => {
		// 	const schedule: CourseSchedule = {
		// 		week: row['주차'].text,
		// 		from: new Date(row['출석기간'].text.split('~')[0].trim()),
		// 		to: new Date(row['출석기간'].text.split('~')[1].trim()),
		// 		contents: row['강의내용'].text,
		// 		remark: row['과제/비고'].text
		// 	};

		// TODO: implement this. currently empty
		weeks: [],

		// 	return [schedule.week, schedule];
		// })) : undefined,
	};
}
