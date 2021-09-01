import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { DOMWindow, JSDOM } from 'jsdom';
import { DoorUnauthorizedError } from './error/error.interfaces';
import { getUser, login, logout } from './user/user';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as AxiosLogger from 'axios-logger';
import { getTermList } from './term/term';
import { getCourseList, getCourseSyllabus } from './course/course';
import { getNoticePost, getNoticePostList } from './post/notice_post';
import { DropFirst } from './helper/typing';
import { getReferencePost, getReferencePostList } from './post/reference_post';
import { getHomework, getHomeworkList } from './assignment/homework';
import { getTeamProject, getTeamProjectList } from './assignment/team_project';
import { getActivity, getActivityList } from './assignment/activity';
import { getLectureList, getLectureProgressList } from './lecture/lecture';
import { download } from './file/download';

export class Door {
	cookieJar: CookieJar;
	axios: AxiosInstance;
	parser: (content: string) => DOMWindow;

	constructor(axiosOptions?: AxiosRequestConfig) {
		this.cookieJar = this.createCookieJar();
		this.axios = this.createAxiosInstance(axiosOptions);
		this.parser = this.createParser();
	}

	getHeaders(): Record<string, string> {
		const headers: Record<string, string> = Object.assign({}, this.axios.defaults.headers);

		headers['Cookie'] = this.cookieJar.getCookieStringSync('http://door.deu.ac.kr');

		return headers;
	}

	createCookieJar(): CookieJar {
		return new CookieJar();
	}

	createAxiosInstance(axiosOptions?: AxiosRequestConfig): AxiosInstance {
		const axiosInstance = axios.create({
			baseURL: 'http://door.deu.ac.kr',
			transformRequest: [
				// 주어진 x-www-form-urlencoded data를 stringify하는 역할
				(data, headers) => qs.stringify(data, { arrayFormat: 'brackets' }),
			],
			timeout: 5000,
			withCredentials: true,
			validateStatus: status => status >= 200 && status <= 302,

			...axiosOptions,
		});

		// keep session using cookie jar. (cookie saved between api calls)
		// see cookie-jar: https://www.npmjs.com/package/axios-cookiejar-support
		axiosCookieJarSupport(axiosInstance);
		axiosInstance.defaults.jar = this.cookieJar;

		// Referer
		axiosInstance.defaults.headers.common['Referer'] = 'http://door.deu.ac.kr';

		// 기본 Accept 헤더는 application/json, text/plain, */* 이렇게 되어있는데
		// 기본 값으로 사용시 서버 측에서 500 Internal 에러 발생
		// IMPORTANT: Accept 헤더는 반드시 */* 로 해야됨
		axiosInstance.defaults.headers.common['Accept'] = '*/*';

		// 서버 측에선 application/x-www-form-urlencoded 외엔 인식하지 못함
		axiosInstance.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

		// 교내 네트워크 사용 시 User-Agent 부분을 수정해야 넷클라이언트 설치 페이지가 뜨지 않음
		// 크롬 정책 상 XHR에서 설정 불가.
		axiosInstance.defaults.headers.common['User-Agent'] =
			'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Mobile Safari/537.36';

		return axiosInstance;
	}

	createParser() {
		return (content: string) => new JSDOM(content).window;
	}

	verbose(): void {
		// use request & response logger
		this.axios.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
		//this.axios.interceptors.response.use(AxiosLogger.responseLogger, AxiosLogger.errorLogger);
	}

	async fetch(url: string, config: AxiosRequestConfig = {}): Promise<DOMWindow> {
		const response = await this.axios({ url, ...config });
		const fetchedPath: string | undefined = response.request.path;

		// detect session logout (will redirect to login page when session expired)
		if (typeof fetchedPath === 'string' && /\/Account\/Index\/\?/.test(fetchedPath)) {
			throw new DoorUnauthorizedError();
		}

		return this.parser(response.data);
	}

	async get(url: string, config: AxiosRequestConfig = {}): Promise<DOMWindow> {
		return this.fetch(url, { method: 'GET', ...config });
	}

	async post(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<DOMWindow> {
		return this.fetch(url, { method: 'POST', data, ...config });
	}

	/**
	 * Door 홈페이지에 로그인을 시도합니다.
	 *
	 * @param id Door 홈페이지에서 사용하는 ID
	 * @param password Door 홈페이지에서 사용하는 패스워드
	 *
	 * @returns 로그인 후 얻은 유저 정보
	 */
	login = (...params: DropFirst<Parameters<typeof login>>) => login(this, ...params);

	/**
	 * Door 홈페이지에서 로그아웃합니다.
	 */
	logout = (...params: DropFirst<Parameters<typeof logout>>) => logout(this, ...params);

	/**
	 * 로그인 되어있는 유저의 정보를 얻습니다.
	 *
	 * @returns 로그인 되어있는 유저 정보
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getUser = (...params: DropFirst<Parameters<typeof getUser>>) => getUser(this, ...params);

	/**
	 * 유저의 모든 학기 목록을 얻습니다.
	 *
	 * @returns 유저의 모든 학기
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getTermList = (...params: DropFirst<Parameters<typeof getTermList>>) => getTermList(this, ...params);

	/**
	 * 해당 학기에 수강하는 모든 강의를 가져옵니다.
	 *
	 * @param termId 학기 ID
	 * @returns 학기에 해당되는 모든 강의 목록
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getCourseList = (...params: DropFirst<Parameters<typeof getCourseList>>) => getCourseList(this, ...params);

	/**
	 * 주어진 강의의 수업계획서를 얻습니다.
	 *
	 * @param courseId 강의 ID
	 * @returns 강의에 해당되는 수업계획서
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getCourseSyllabus = (...params: DropFirst<Parameters<typeof getCourseSyllabus>>) => getCourseSyllabus(this, ...params);

	/**
	 * 주어진 강의의 공지사항 게시물들을 가져옵니다.
	 *
	 * @param courseId 강의 ID
	 * @returns 강의에서 작성된 공지사항 게시물 목록
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getNoticePostList = (...params: DropFirst<Parameters<typeof getNoticePostList>>) => getNoticePostList(this, ...params);

	/**
	 * 주어진 공지사항 게시물의 내용, 첨부파일 등 세부 사항을 얻어옵니다.
	 *
	 * @returns 공지사항 게시물의 내용
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getNoticePost = (...params: DropFirst<Parameters<typeof getNoticePost>>) => getNoticePost(this, ...params);

	/**
	 * 주어진 강의의 강의자료 목록을 가져옵니다.
	 *
	 * @returns 강의에 해당되는 강의자료 게시물 목록
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getReferencePostList = (...params: DropFirst<Parameters<typeof getReferencePostList>>) => getReferencePostList(this, ...params);

	/**
	 * 주어진 강의자료 게시물의 내용, 첨부파일 등 세부 사항을 얻어옵니다.
	 *
	 * @returns 강의자료 게시물의 내용
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getReferencePost = (...params: DropFirst<Parameters<typeof getReferencePost>>) => getReferencePost(this, ...params);

	/**
	 * 주어진 강의의 과제 목록을 가져옵니다.
	 *
	 * @returns 강의에 해당되는 과제 게시물 목록
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getHomeworkList = (...params: DropFirst<Parameters<typeof getHomeworkList>>) => getHomeworkList(this, ...params);

	/**
	 * 주어진 과제의 내용, 첨부파일 등 세부 사항을 얻어옵니다.
	 *
	 * @returns 과제 게시물의 내용
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getHomework = (...params: DropFirst<Parameters<typeof getHomework>>) => getHomework(this, ...params);

	/**
	 * 주어진 강의의 팀 프로젝트 결과 목록을 가져옵니다.
	 *
	 * @returns 강의에 해당되는 팀 프로젝트 결과 게시물 목록
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getTeamProjectList = (...params: DropFirst<Parameters<typeof getTeamProjectList>>) => getTeamProjectList(this, ...params);

	/**
	 * 주어진 팀 프로젝트 결과 게시물의 내용, 첨부파일 등 세부 사항을 얻어옵니다.
	 *
	 * @returns 팀 프로젝트 결과 게시물의 내용
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getTeamProject = (...params: DropFirst<Parameters<typeof getTeamProject>>) => getTeamProject(this, ...params);

	/**
	 * 주어진 강의의 수업활동일지 게시물 목록을 가져옵니다.
	 *
	 * @returns 강의에 해당되는 수업활동일지 게시물 목록
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getActivityList = (...params: DropFirst<Parameters<typeof getActivityList>>) => getActivityList(this, ...params);

	/**
	 * 주어진 수업활동일지 게시물의 내용, 첨부파일 등 세부 사항을 얻어옵니다.
	 *
	 * @returns 수업활동일지 게시물의 내용
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getActivity = (...params: DropFirst<Parameters<typeof getActivity>>) => getActivity(this, ...params);

	/**
	 * 온라인강의 목록을 가져옵니다.
	 *
	 * @returns 온라인강의 목록
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getLectureList = (...params: DropFirst<Parameters<typeof getLectureList>>) => getLectureList(this, ...params);

	/**
	 * 온라인강의의 진행 상태를 가져옵니다.
	 *
	 * @returns 온라인강의 진행 상태 목록
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	getLectureProgressList = (...params: DropFirst<Parameters<typeof getLectureProgressList>>) => getLectureProgressList(this, ...params);

	/**
	 * Door에 게시되어 있는 파일을 다운로드합니다.
	 *
	 * @returns Door 시스템에 업로드 되어있는 파일
	 * @throws {DoorUnauthorizedError} 로그인 되어있지 않을 시 발생하는 에러
	 */
	download = (...params: DropFirst<Parameters<typeof download>>) => download(this, ...params);
}
