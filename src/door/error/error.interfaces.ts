export class DoorError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'DoorError';
	}
}

export class DoorUnauthorizedError extends DoorError {
	constructor(message?: string) {
		super(message ?? '로그아웃 처리되어 있습니다. 로그인 후 시도해주세요.');
		this.name = 'DoorUnauthorizedError';
	}
}

export class DoorLoginError extends DoorError {
	constructor(message?: string) {
		super(message ?? '로그인할 수 없습니다.');
		this.name = 'DoorIncorrectPasswordError';
	}
}
