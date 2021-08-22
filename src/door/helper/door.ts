/**
 * Example data
 *
 * viewDoor(cn, dn, dt, dst, dd, df, dw, dh, fid, inningno, astatus)
 *
 * 기초프로그래밍II 유투브 강의 2개
 * viewDoor(36463,71897, 0, 0, 'https://youtu.be/-m_x6xyowvQ', 0, 560, 315, 'frmpop');
 * viewDoor(36463,71994, 0, 0, 'https://youtu.be/Z6TjsQ_j9ZY', 0, 560, 315, 'frmpop');
 *
 * ICT융합기술론 PPT 자료
 * viewDoor(36299,66770, 1, 5, '', 1632456, 560, 315, 'frmpop');
 * viewDoor(36299,71312, 1, 5, '', 1674655, 560, 315, 'frmpop');
 *
 * 비주얼프로그래밍 자체 동영상 플레이어 (재생기록 X)
 * viewDoor(36713,73268, 0, 3, '', 1690422, 1280, 720, 'frmpop');
 * viewDoor(36713,70701, 0, 3, '', 1668171, 1280, 720, 'frmpop');
 * viewDoor(36713,70702, 0, 3, '', 1668179, 1280, 720, 'frmpop');
 *
 * 부산과세계 온라인강의 자체 동영상 플레이어 (재생기록 O)
 * javascript:viewDoor(34300,557, 0, 2, '', 0, 560, 315, 'frmpop', 436049, 'CLAT001');
 * javascript:viewDoor(34300,563, 0, 2, '', 0, 560, 315, 'frmpop', 436055, 'CLAT001');
 */
//eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const parseViewDoor = (func: string) => {
	const params = (func.match(/viewDoor\((?<params>.*)\)/)?.groups?.params || '').split(',').map(d => d.replaceAll("'", '').trim());

	const DoorType = {
		// 도어 내부에서 제공되는 경우 (url이 door.deu.ac.kr인 경우)
		BUILTIN: '0',
		// 외부 링크인 경우
		EXTERNAL: '1',
	};

	const Destination = {
		UNKNOWN_0: '0',
		UNKNOWN_2: '2',
		UNKNOWN_3: '3',
		FILE: '5',
	};

	const namedParams = {
		courseId: params[0],
		doorId: params[1],
		doorType: params[2] as keyof typeof DoorType,
		destination: params[3] as keyof typeof Destination,
		externalUrl: decodeURIComponent(params[4]),
		fileId: params[5],
		doorWidth: params[6],
		doorHeight: params[7],
		fid: params[8] || 'frmpop',
		inningno: params[9] || 0,
		astatus: params[10],
	};

	let url =
		namedParams.doorType === DoorType.BUILTIN
			? // Using built-in video player. (whether the type is online or offline)
			  namedParams.destination === Destination.UNKNOWN_0
				? namedParams.externalUrl
				: `/Door/DoorView?DoorNo=${namedParams.doorId}&CoursesNo=${namedParams.courseId}&InningNo=${namedParams.inningno}`
			: // Using external link or file.
			namedParams.destination === Destination.FILE
			? `/common/filedownload/${namedParams.fileId}`
			: namedParams.destination === Destination.UNKNOWN_0
			? namedParams.externalUrl
			: '';

	// Default link is door.deu.ac.kr
	if (url.startsWith('/')) url = 'http://door.deu.ac.kr' + url;

	const result: {
		doorId: string;
		url: string;
		//historyLink: ILink;
	} = {
		doorId: namedParams.doorId,
		url: url,
		// historyLink: {
		// 	url: '/Door/DoorViewHistory',
		// 	method: 'POST',
		// 	data: {
		// 		DoorNo: namedParams.doorId,
		// 		CourseNo: namedParams.courseId,
		// 	},
		// },
	};

	return result;
};
