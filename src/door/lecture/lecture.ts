import assert from 'assert';
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
	return '알 수 없음';
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
	const { document, HTMLTableElement } = await door.get(`/LMS/StudyRoom/Index/${courseId}`);
	const table = document.querySelector('table#gvListTB');

	assert(table instanceof HTMLTableElement);

	const lectures: Lecture[] = parseListedTableElement(table).map(row => {
		const { url } = getDoorLink(row['강의주제'].querySelector('a')?.getAttribute('onclick') || '');

		return {
			courseId,
			title: row['강의주제'].querySelector('a')?.textContent?.trim() || '',
			type: parseImageText(row['수업 형태'].querySelector('img')?.getAttribute('src') || '') as LectureType,

			week: Number(row['주차'].text),
			period: Number(row['차시'].text),
			duration: {
				// TODO: implement moment based parse
				from: row['수업기간'].text.split(' ~ ')[0],
				to: row['수업기간'].text.split(' ~ ')[1],
			},
			length: Number(row['학습시간(분)'].text),
			attendance: parseImageText(row['출결상태'].querySelector('img')?.getAttribute('src') || '') as LectureAttendance,

			url,
		};
	});

	return lectures;
}
