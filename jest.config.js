module.exports = {
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
	testRegex: '\\.test\\.ts$',
	globals: {
		'ts-jest': {
			diagnostics: true,
		},
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
};
