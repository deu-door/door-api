import assert from 'assert';
import { endOfDay, startOfDay } from 'date-fns';
import { Course } from '../course/course.interfaces';
import { Door } from '..';
import { parseViewDoor } from '../helper/door';
import { parseListedTableElement } from '../helper/table';
import { Lecture, LectureAttendance, LectureProgress, LectureType } from './lecture.interfaces';

function parseImageText(src: string) {
	switch (src) {
		case '/Content/images/common/BT_LecRoom01_01.gif':
			return '시험';
		case '/Content/images/common/BT_LecRoom01_02.gif':
			return '강의';
		case '/Content/images/common/BT_LecRoom01_03.gif':
			return '공지';
		case '/Content/images/common/BT_LecRoom01_04.gif':
			return '출제';
		case '/Content/images/common/BT_LecRoom01_05.gif':
			return '미수강';
		case '/Content/images/common/BT_LecRoom01_06.gif':
			return '휴강';
		case '/Content/images/common/BT_LecRoom01_07.gif':
			return '강의';
		case '/Content/images/common/BT_LecRoom01_08.gif':
			return '대면';
		case '/Content/images/common/BT_LecRoom01_09.gif':
			return '미등록';
		case '/Content/images/common/BT_LecRoom01_10.gif':
			return '다운로드';
		case '/Content/images/common/icon_LecRoom02_01.gif':
			return '결석';
		case '/Content/images/common/icon_LecRoom02_02.gif':
			return '완료전';
		case '/Content/images/common/icon_LecRoom02_03.gif':
			return '출석';
		case '/Content/images/common/icon_LecRoom02_04.gif':
			return '지각';
	}
	return undefined;
}

const getDoorLink = (onclick: string) => {
	if (!/viewDoor/.test(onclick)) return {};

	const viewDoor = parseViewDoor(onclick);

	if (viewDoor.url) return viewDoor;

	return {
		url: undefined,
		historyLink: undefined,
		doorId: undefined,
	};
};

export async function getLectureList(door: Door, courseId: Course['id']): Promise<Lecture[]> {
	const document = await door.get(`/LMS/StudyRoom/Index/${courseId}`);

	const table = document.querySelector('table#gvListTB');
	const termOptions = document.querySelector('#tno'); // 연도를 가져오기 위함
	assert(table?.tagName.toLowerCase() === 'table' && termOptions?.tagName.toLowerCase() === 'select');

	const year = /(\d+)년도/.exec(termOptions.querySelector('option[selected]')?.text.trim() ?? '')?.[1];
	assert(year !== undefined && /\d+/.test(year));

	const lectures: Lecture[] = parseListedTableElement(table).map(row => {
		const { url } = getDoorLink(row['강의주제'].querySelector('a')?.getAttribute('onclick') || '');
		const [from, to] = row['수업기간'].text
			.trim()
			.split('~')
			.map(token => new Date(`${year}-${token.trim()}`));

		return {
			courseId,
			title: row['강의주제'].querySelector('a')?.text.trim() || '',
			type: parseImageText(row['수업 형태'].querySelector('img')?.getAttribute('src') || '') as LectureType,

			week: Number(row['주차'].text.trim()),
			period: Number(row['차시'].text.trim()),
			duration: {
				from: startOfDay(from).toISOString(),
				to: endOfDay(to).toISOString(),
			},
			length: Number(row['학습시간(분)'].text.trim()),
			attendance: parseImageText(row['출결상태'].querySelector('img')?.getAttribute('src') || '') as LectureAttendance | undefined,

			url,
		};
	});

	return lectures;
}

export async function getLectureProgressList(door: Door, courseId: Course['id']): Promise<LectureProgress[]> {
	const document = await door.get(`/LMS/LectureRoom/CourseLectureInfo/${courseId}`);

	const learningProgressTable = document.querySelector('#gvListTB');

	assert(learningProgressTable?.tagName.toLowerCase() === 'table');

	const lectureProgresses: LectureProgress[] = parseListedTableElement(learningProgressTable).map(row => ({
		courseId,

		week: Number(row['주차'].text.trim()),
		period: Number(row['차시'].text.trim()),

		// type: row['수업형태'].text.trim() as LectureProgress['type'],

		// parse later
		attendance: '수업없음',

		length: Number(row['학습시간(분)'].text.trim().split('/')[1]),
		current: Number(row['학습시간(분)'].text.trim().split('/')[0]),

		views: Number(row['강의접속수'].text.trim()),

		startedAt: row['최초학습일'].text.trim().length > 0 ? new Date(row['최초학습일'].text.trim()).toISOString() : undefined,
		finishedAt: row['학습완료일'].text.trim().length > 0 ? new Date(row['학습완료일'].text.trim()).toISOString() : undefined,
		recentViewedAt: row['최근학습일'].text.trim().length > 0 ? new Date(row['최근학습일'].text.trim()).toISOString() : undefined,
	}));

	return lectureProgresses;
}
