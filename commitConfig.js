/**  共享的Git提交配置 */
const commitTypes = [
  {
    value: 'feat',
    name: 'feat:     新增功能 | A new feature',
    description: '新增功能',
  },
  {
    value: 'fix',
    name: 'fix:      修复缺陷 | A bug fix',
    description: '修复',
  },
  {
    value: 'style',
    name: 'style:    代码格式 | Changes that do not affect the meaning of the code',
    description: '样式',
  },
  {
    value: 'build',
    name: 'build:    构建相关 | Changes that affect the build system or external dependencies',
    description: '构建打包',
  },
  {
    value: 'revert',
    name: 'revert:   回退代码 | Revert to a commit',
    description: '回退',
  },
  {
    value: 'perf',
    name: 'perf:     性能提升 | A code change that improves performance',
    description: '性能优化',
  },
  {
    value: 'ci',
    name: 'ci:       持续集成 | Changes to our CI configuration files and scripts',
    description: '持续集成',
  },
  {
    value: 'refactor',
    name: 'refactor: 代码重构 | A code change that neither fixes a bug nor adds a feature',
    description: '重构',
  },
  {
    value: 'docs',
    name: 'docs:     文档更新 | Documentation only changes',
    description: '文档',
  },
];

// 提取类型值数组，用于commitlint验证
const commitTypeValues = commitTypes.map(type => type.value);

module.exports = {
  commitTypes,
  commitTypeValues,
};
