import assert from 'assert';
import { Course } from '../course/course.interfaces';
import { Door } from '../door';
import { parseSubmission } from '../helper/submission';
import { parseInformaticTableElement, parseListedTableElement } from '../helper/table';
import { AssignmentType, AssignmentVariant } from './assignment.interfaces';
import { TeamProject, TeamProjectHead } from './team_project.interfaces';

export async function getTeamProjectList(door: Door, courseId: Course['id']): Promise<TeamProjectHead[]> {
	const { document, HTMLTableElement } = await door.get(`/LMS/LectureRoom/CourseTeamProjectStudentList/${courseId}`);
	const teamProjectTable = document.querySelector('#sub_content2 > div:nth-child(4) > table');

	assert(teamProjectTable instanceof HTMLTableElement);

	const teamProjectHeads: TeamProjectHead[] = parseListedTableElement(teamProjectTable)
		// filter for 등록된 팀프로젝트가 없습니다
		.filter(row => /\d+/.test(row['No'].text))
		.map(row => {
			const [from, to] = row['제출기간'].text.split('~').map(date => new Date('20' + date.trim()).toISOString());

			return {
				variant: AssignmentVariant.TEAM_PROJECT as const,
				partial: true as const,

				id: row['팀프로젝트 제목'].url?.match(/ProjectNo=(\d+)/)?.[1] || '',
				courseId: courseId,

				title: row['팀프로젝트 제목'].text,
				type: row['제출방식'].text as AssignmentType,
				duration: { from, to },
				submitted: row['제출 여부'].text === '제출',
			};
		})
		.filter(teamProjectHead => teamProjectHead.id !== '');

	return teamProjectHeads;
}

export async function getTeamProject(door: Door, head: Pick<TeamProjectHead, 'courseId' | 'id'>): Promise<TeamProject> {
	const { courseId, id } = head;

	const { document, HTMLTableElement, HTMLFormElement } = await door.get(
		`/LMS/LectureRoom/CourseTeamProjectStudentDetail?CourseNo=${courseId}&ProjectNo=${id}`,
	);

	const descriptionTable = document.querySelector('#sub_content2 > div.form_table_b > table');
	const submissionTable = document.querySelector('#CourseLeture > div.form_table_s > table');
	const form = document.querySelector('#CourseLeture');

	assert(descriptionTable instanceof HTMLTableElement && submissionTable instanceof HTMLTableElement && form instanceof HTMLFormElement);

	const description = parseInformaticTableElement(descriptionTable);

	const attachments = [...description['첨부파일'].querySelectorAll('a')]
		.map(fileElement => ({
			title: fileElement.textContent?.trim() || '',
			url: fileElement.getAttribute('href') || '',
		}))
		.filter(attachment => attachment.url !== '');

	const [from, to] = description['제출기간'].text.split('~').map(date => new Date('20' + date.trim()).toISOString());

	// 제출 관련 정보 파싱
	const submission = parseSubmission(submissionTable);

	return {
		variant: AssignmentVariant.TEAM_PROJECT,
		partial: false,

		id,
		courseId,

		type: AssignmentType.TEAM,
		title: description['제목']?.text ?? description['주제']?.text ?? '제목이 없습니다',
		contents: description['내용']?.innerHTML ?? description['수업내용']?.innerHTML ?? '',

		duration: { from, to },
		attachments,
		submitted: submission.contents.length > 0 || submission.attachments.length > 0,
		submission,
	};
}
