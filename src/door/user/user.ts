import assert from 'assert';
import { Door } from '..';
import { DoorLoginError } from '../error';
import { User } from './user.interfaces';

export async function login(door: Door, id: string, password: string): Promise<User> {
	try {
		// alreay logined?
		return await getUser(door);
	} catch (e) {
		// Login required. continue
	}

	// get login page from
	const document = await door.get('https://door.deu.ac.kr/Account/Index');

	// submit form on login page
	const response = await door.axios.post(
		'https://door.deu.ac.kr/Account/LogOnProcess',
		{
			...Object.fromEntries(
				document.querySelectorAll('form input').map(input => [input.getAttribute('name'), input.getAttribute('value')]),
			),
			Message: '',
			userid: id,
			password: password,
		},
		{
			headers: {
				referer: 'https://door.deu.ac.kr/Account/Index',
			},
			maxRedirects: 0,
		},
	);

	const error = /door\.deu\.ac\.kr\/Account\/Index\?ErrorMessage=(.+)/.exec(response.headers['location'] ?? '')?.[1];

	if (error === undefined) {
		// successfully logined
		return await getUser(door);
	} else if (error === 'MSG_ERROR_LOGIN') {
		// incorrect password
		throw new DoorLoginError('아이디 또는 비밀번호가 틀렸습니다. 확인 후 다시 시도해주세요.');
	} else {
		// unknown error
		throw new DoorLoginError(error);
	}
}

export async function logout(door: Door): Promise<void> {
	try {
		// check user logined
		await getUser(door);
	} catch (e) {
		// Not logined, quit
		return;
	}

	// GET http://door.deu.ac.kr/Account/LogOff
	// --> 302 REDIRECT https://door.deu.ac.kr/Account/LogOff
	// --> 302 REDIRECT https://door.deu.ac.kr/sso/logout.aspx
	await door.axios.get('http://door.deu.ac.kr/Account/LogOff');
}

export async function getUser(door: Door): Promise<User> {
	const document = await door.get('https://door.deu.ac.kr/Mypage/MyInfo');

	const table = document.querySelector('#sub_content2 table table');
	assert(table?.tagName.toLowerCase() === 'table');

	const id = table.querySelector(`tbody > tr:nth-child(2) > td:nth-child(4)`)?.text.trim();
	const name = table.querySelector(`tbody > tr:nth-child(2) > td:nth-child(2)`)?.text.trim();
	const studentType = table.querySelector(`tbody > tr:nth-child(1) > td:nth-child(2)`)?.text.trim();
	const major = table.querySelector(`tbody > tr:nth-child(1) > td:nth-child(4)`)?.text.trim();

	assert(id !== undefined && name !== undefined && studentType !== undefined && major !== undefined);

	// 서버 측에서 세션 ID를 인식하여 사용자에 맞는 이미지를 전송하게끔 되어있음
	const profileUrl = 'https://door.deu.ac.kr/Mypage/UserImage';

	return { id, name, studentType, major, profileUrl };
}
