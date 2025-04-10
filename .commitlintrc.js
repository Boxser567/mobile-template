const { commitTypeValues } = require('./commitConfig');

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', commitTypeValues],
    'type-case': [0],
    'type-empty': [0], // 允许提交信息中的作用域为空
    'subject-full-stop': [0], // 提交主题（subject）不强制以句号结尾。
    'body-leading-blank': [0], // 提交信息的主体部分（如果有）不强制要求以空行开头
    'body-max-line-length': [0],
    'footer-leading-blank': [0],
    'scope-empty': [0],
    'scope-case': [0],
    'subject-empty': [2, 'never'], // 不允许 subject 为空
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 72],
  },
};
