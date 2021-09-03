export class DoorError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'DoorError';
	}
}

export class DoorLoginError extends DoorError {
	constructor(message?: string) {
		super(message ?? '로그인할 수 없습니다.');
		this.name = 'DoorIncorrectPasswordError';
	}
}

export class DoorUnavailableError extends DoorError {
	constructor(message?: string) {
		super(message ?? '서비스를 이용할 수 없습니다. 서버 또는 네트워크에 문제가 있습니다.');
		this.name = 'DoorUnavailableError';
	}
}

export class DoorUnauthorizedError extends DoorUnavailableError {
	constructor(message?: string) {
		super(message ?? '로그아웃 처리되어 있습니다. 로그인 후 시도해주세요.');
		this.name = 'DoorUnauthorizedError';
	}
}
