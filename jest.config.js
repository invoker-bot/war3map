module.exports={
    testEnvironment: 'node',
    transform: {
      "^.+\\.ts$": "ts-jest"
    },
    moduleFileExtensions: [
      "ts",
      "js",
      "json",
      "node",
    ],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)$',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.{ts,js}',
      '!src/**/*.d.ts',
    ],


};