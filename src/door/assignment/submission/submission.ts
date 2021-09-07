import assert from 'assert';
import { Activity, AssignmentType, Homework, TeamProject } from '..';
import { Door } from '../..';
import FormData from 'form-data';
import { AxiosRequestConfig } from 'axios';

export async function submitSubmission(
	door: Door,
	assignment: Pick<Homework | TeamProject | Activity, 'courseId' | 'type' | 'id'>,
	submission: { contents: string; file?: unknown },
): Promise<void> {
	const { courseId, type, id } = assignment;
	const { contents, file } = submission;

	const url =
		type === AssignmentType.TEAM
			? `/LMS/LectureRoom/CourseTeamProjectStudentDetail?CourseNo=${courseId}&ProjectNo=${id}`
			: `/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo=${courseId}&HomeworkNo=${id}`;
	const document = await door.get(url);
	const form = document.querySelector('#CourseLeture');
	assert(form?.tagName.toLowerCase() === 'form');

	const fields: Partial<{
		FileGroupNo: string;
		TFFile: null;
		id: string;
		'coursehomeworksubmits.CourseNo': string;
		'coursehomeworksubmits.FileGroupNo': string;
		'coursehomeworksubmits.SubmitNo': string;
		'coursehomeworksubmits.HomeworkNo': string;
		'coursehomeworksubmits.StrUserNo': string;
		'coursehomeworksubmits.IsOutput': string;
	}> = Object.fromEntries(
		form.querySelectorAll('input[name]').map(element => [element.getAttribute('name'), element.getAttribute('value')]),
	);

	const contentsInput = form.querySelector('textarea');
	const fileInput = form.querySelector('input[type=file]');

	const formData = new FormData();
	// add default fields into formData
	// value must be truthy value
	Object.entries(fields).forEach(([key, value]) => value && formData.append(key, value));

	// insert submission contents, file into formData
	if (contents !== undefined && contentsInput?.tagName.toLowerCase() === 'textarea')
		formData.append(contentsInput.getAttribute('name') ?? 'coursehomeworksubmits.SubmitContents', contents);
	if (file !== undefined && fileInput?.tagName.toLowerCase() === 'input')
		formData.append(fileInput.getAttribute('name') ?? 'TFFile', file);

	await door.post(form.getAttribute('action') ?? url, formData, {
		method: form.getAttribute('method') as AxiosRequestConfig['method'],
		// Content-Type은 form-data 모듈에 의해 채워넣게 됨
		headers: {
			referer: url,
			...formData.getHeaders(),
		},
		maxRedirects: 0,
	});
}
