const { commitTypes } = require('./commitConfig');

module.exports = {
  subjectLimit: 0, // 设置为 0 来取消字符长度限制
  useEmoji: true,
  breaklineChar: '|',
  // subjectLimit: 0, // 设置为 0 来取消字符长度限制
  allowBreakingChanges: ['feat', 'fix'],
  skipQuestions: ['scope', 'body', 'breaking', 'footer'],
  messages: {
    type: '选择你要提交的类型: ',
    subject: '填写变更描述 :\n',
    confirmCommit: '再次确认是否提交？',
  },
  types: commitTypes,
};
