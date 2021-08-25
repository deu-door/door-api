import assert from 'assert';
import { Course } from '../course/course.interfaces';
import { Door } from '../door';
import { parseSubmission } from '../helper/submission';
import { parseInformaticTableElement, parseListedTableElement } from '../helper/table';
import { AssignmentType, AssignmentVariant } from './assignment.interfaces';
import { Homework, HomeworkHead } from './homework.interfaces';

export async function getHomeworkList(door: Door, courseId: Course['id']): Promise<HomeworkHead[]> {
	const { document, HTMLTableElement } = await door.get(`/LMS/LectureRoom/CourseHomeworkStudentList/${courseId}`);
	const table = document.querySelector('#sub_content2 > div > table');

	assert(table instanceof HTMLTableElement);

	const homeworkHeads: HomeworkHead[] = parseListedTableElement(table)
		// filter for 등록된 과제가 없습니다
		.filter(row => /\d+-\d+/.test(row['주차-차시'].text))
		.map(row => {
			const [from, to] = row['제출기간'].text.split('~').map(date => new Date('20' + date.trim()).toISOString());
			const [week, period] = row['주차-차시'].text.split('-').map(Number);

			return {
				variant: AssignmentVariant.HOMEWORK as const,
				partial: true as const,

				id: row['과제제목'].url?.match(/HomeworkNo=(\d+)/)?.[1] || '',
				courseId: courseId,

				title: row['과제제목'].text,
				type: row['과제유형'].text as AssignmentType,
				duration: { from, to },
				submitted: row['제출여부'].text === '제출',

				week,
				period,
			};
		})
		.filter(homeworkHead => homeworkHead.id !== '');

	return homeworkHeads;
}

export async function getHomework(door: Door, head: Pick<HomeworkHead, 'courseId' | 'id'>): Promise<Homework> {
	const { courseId, id } = head;
	const { document, HTMLTableElement, HTMLFormElement } = await door.get(
		`/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo=${courseId}&HomeworkNo=${id}`,
	);

	const descriptionTable = document.querySelector('#sub_content2 > div:nth-child(1) > table');
	//const resultTable = document.querySelector('#sub_content2 > div:nth-child(3) > table:not(.tbl_type)'); // this may be a null
	const submissionTable = document.querySelector('#sub_content2 > div.form_table_s > table');
	const submissionForm = document.querySelector('#CourseLeture');

	assert(
		descriptionTable instanceof HTMLTableElement &&
			submissionTable instanceof HTMLTableElement &&
			submissionForm instanceof HTMLFormElement,
	);

	const description = parseInformaticTableElement(descriptionTable);

	// 시간이 많이 지나면 평가 결과 table은 없어질 수도 있음
	//const result = resultTable instanceof HTMLTableElement ? parseInformaticTableElement(resultTable) : undefined;

	const attachments = [...description['첨부파일'].querySelectorAll('a')]
		.map(fileElement => ({
			title: fileElement.textContent?.trim() || '',
			url: fileElement.getAttribute('href') || '',
		}))
		.filter(attachment => attachment.url !== '');

	// const resultComment = result?.['코멘트'].text;
	// const resultScore = Number(result?.['점수']?.text?.match(/\d+/)?.[0]) || undefined;

	const [from, to] = description['제출기간'].text.split('~').map(date => new Date('20' + date.trim()).toISOString());
	const [week, period] = description['주차-차시'].text.split('~').map(token => parseInt(token.trim()));

	const additionalDuration =
		description['추가 제출기간'].text.trim() === '없음'
			? undefined
			: description['추가 제출기간'].text.split('~').map(date => new Date('20' + date.trim()).toISOString());

	// 제출 관련 정보 파싱
	const submission = parseSubmission(submissionTable);

	return {
		variant: AssignmentVariant.HOMEWORK,
		partial: false,

		id,
		courseId,
		type: description['과제유형'].text as AssignmentType,
		title: description['제목'].text,
		contents: description['내용'].innerHTML ?? '',

		duration: { from, to },
		additionalDuration: additionalDuration === undefined ? undefined : { from: additionalDuration[0], to: additionalDuration[1] },

		attachments,
		submitted: submission.contents.length > 0 || submission.attachments.length > 0,
		submission,

		week,
		period,

		// evaluationResult:
		// 	resultComment || resultScore
		// 		? {
		// 				score: resultScore,
		// 				comment: resultComment,
		// 		  }
		// 		: undefined,
	};
}
