import assert from 'assert';
import { endOfDay, startOfDay } from 'date-fns';
import { Course } from '../course/course.interfaces';
import Door from '../door';
import { parseViewDoor } from '../helper/door';
import { parseListedTableElement } from '../helper/table';
import { Lecture, LectureAttendance, LectureType } from './lecture.interfaces';

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
	const { document, HTMLTableElement, HTMLSelectElement } = await door.get(`/LMS/StudyRoom/Index/${courseId}`);

	const table = document.querySelector('table#gvListTB');
	const termOptions = document.querySelector('#tno'); // 연도를 가져오기 위함

	assert(table instanceof HTMLTableElement && termOptions instanceof HTMLSelectElement);

	const year = /(\d+)년도/.exec(termOptions.querySelector('option[selected]')?.textContent ?? '')?.[1];
	assert(year !== undefined && /\d+/.test(year));

	const lectures: Lecture[] = parseListedTableElement(table).map(row => {
		const { url } = getDoorLink(row['강의주제'].querySelector('a')?.getAttribute('onclick') || '');
		const [from, to] = row['수업기간'].text.split('~').map(token => new Date(`${year}-${token.trim()}`));

		return {
			courseId,
			title: row['강의주제'].querySelector('a')?.textContent?.trim() || '',
			type: parseImageText(row['수업 형태'].querySelector('img')?.getAttribute('src') || '') as LectureType,

			week: Number(row['주차'].text),
			period: Number(row['차시'].text),
			duration: {
				from: startOfDay(from).toISOString(),
				to: endOfDay(to).toISOString(),
			},
			length: Number(row['학습시간(분)'].text),
			attendance: parseImageText(row['출결상태'].querySelector('img')?.getAttribute('src') || '') as LectureAttendance | undefined,

			url,
		};
	});

	return lectures;
}