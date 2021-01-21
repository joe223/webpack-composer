module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: [
        './__test__/unit'
    ],
    collectCoverage: true,
    coverageDirectory: './coverage'
}
