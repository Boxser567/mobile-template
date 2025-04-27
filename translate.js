const fs = require('fs');
const path = require('path');
const pinyin = require('pinyin').default;
// 添加axios依赖用于调用翻译API
// const axios = require('axios');

const generateStableHash = str => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  hash = Math.abs(hash);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const position = Math.floor(hash / Math.pow(62, i)) % 62;
    result += letters[position];
  }
  return result;
};

// 读取现有的 locales 文件内容
const loadExistingLocales = localeDir => {
  const locales = {
    zh_CN: {},
    en_US: {},
    zh_HK: {},
  };

  ['zh_CN', 'en_US', 'zh_HK'].forEach(lang => {
    const filePath = path.join(localeDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      try {
        locales[lang] = JSON.parse(content);
      } catch (error) {
        console.log('load existing locales error', error);
      }
    }
  });

  return locales;
};

// 生成拼音函数，提取最多4个汉字的拼音
const generatePinyinKey = text => {
  return generateStableHash(text);

  // 判断是否全是英文字母组成的字符串（包含空格等分隔符情况）
  const isEnglishText = /^[a-zA-Z\s.,?!:;'"-]+$/.test(text);
  const chineseText = text.match(/[\u4e00-\u9fa5]/g);
  if (isEnglishText) {
    // 如果是单个英文字母，直接返回该字母
    if (!/\s/.test(text)) {
      return text.toLowerCase();
    }
    // 如果是英文句子等，提取每个单词的首字母并拼接
    const words = text.split(/\s+/);
    const firstLetters = words.map(word => word.charAt(0).toLowerCase());
    return firstLetters.join('');
  }
  if (chineseText) {
    const chars = chineseText.slice(0, 4).join('');
    return pinyin(chars, { style: pinyin.STYLE_NORMAL }).flat().join('');
  }

  return '';
};

// 递归遍历文件夹，找到所有符合条件的文件
const traverseDirectory = (dir, extensions) => {
  let files = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      files = files.concat(traverseDirectory(fullPath, extensions));
    } else if (extensions.includes(path.extname(item))) {
      files.push(fullPath);
    }
  });

  return files;
};

// 处理每个文件，搜集翻译文案并替换
const processFile = (filePath, locales, existingLocales, defaultLang) => {
  let fileContent = fs.readFileSync(filePath, 'utf-8');

  // 修改正则表达式以正确匹配未提取的文案和已提取的文案
  const regexes = [
    // 匹配未提取的文案: $t('文本') 或 $t('文本', '参数') 或 $t('文本', {参数})
    // 但不匹配已经有标准格式key的情况 (任何包含两个点的key，如module.file.hash)
    /\$t\(\s*'(?!.*\..*\.[a-zA-Z0-9]{6})([^']*)'\s*(?:,\s*(?:'([^']*)'|\{[^}]+\}))?\s*\)/g,

    // 匹配已提取的文案: $t('module.file.hash', '文本')
    /\$t\('([\w\-]+\.[\w\-]+\.[a-zA-Z0-9]{6})',\s*'([^']+)'\)/g,

    // 匹配已提取的带参数的文案: $t('module.file.hash', '文本', {参数})
    /\$t\('([\w\-]+\.[\w\-]+\.[a-zA-Z0-9]{6})',\s*'([^']+)',\s*\{([^}]+)\}\)/g,
  ];

  regexes.forEach((regex, regIndex) => {
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
      let originalTexts = [];
      let params = '';
      let key = '';
      switch (regexes.indexOf(regex)) {
        case 0:
          originalTexts.push(match[1]);
          key = `${path.basename(path.dirname(filePath))}.${path.basename(filePath, path.extname(filePath))}.${generatePinyinKey(originalTexts.join(''))}`;

          // 检查是否已存在相同的key或文本
          if (existingLocales.zh_CN[key]) {
            console.log(`Skipping already processed text with key: ${key}`);
            continue;
          }

          // 检查是否已存在相同的文本内容（通过遍历现有的locales）
          let textExists = false;
          const textToCheck = originalTexts.join('');
          Object.entries(existingLocales.zh_CN).forEach(([existingKey, existingText]) => {
            if (existingText === textToCheck) {
              console.log(`Skipping already processed text: "${textToCheck}" with existing key: ${existingKey}`);
              textExists = true;
              // 使用已存在的key替换
              key = existingKey;
            }
          });

          if (textExists) {
            // 如果文本已存在，使用已有的key进行替换
            const newText = `$t('${key}', '${originalTexts.join("', '")}'${params ? `, {${params}}` : ''})`;
            fileContent = fileContent.replace(match[0], newText);
            continue;
          }

          // 处理有参数场景 $t('xxx',{chat:1})
          let minRegex = /\$t\('.*?',\s*\{([^{}]+)\}\)/;
          let minMatch = minRegex.exec(match[0]);
          if (minMatch?.length > 1) {
            params = minMatch[1];
          }

          const newText = `$t('${key}', '${originalTexts.join("', '")}'${params ? `, {${params}}` : ''})`;

          fileContent = fileContent.replace(match[0], newText);
          locales.zh_CN[key] = originalTexts.join('');
          break;
        case 1:
          key = match[1];
          originalTexts.push(match[2]);
          // 已提取的文案不需要替换，只需记录
          if (!locales.zh_CN[key]) {
            locales.zh_CN[key] = originalTexts.join('');
          }
          break;
        case 2:
          key = match[1];
          originalTexts.push(match[2]);
          params = match[3];
          // 已提取的文案不需要替换，只需记录
          if (!locales.zh_CN[key]) {
            locales.zh_CN[key] = originalTexts.join('');
          }
          break;
      }

      if (key === '') {
        key = `${path.basename(path.dirname(filePath))}.${path.basename(filePath, path.extname(filePath))}.${generatePinyinKey(originalTexts.join(''))}`;
      }

      ['zh_CN', 'en_US', 'zh_HK'].forEach(item => {
        if (item === defaultLang) {
          locales[defaultLang][key] = originalTexts.join('');
        } else {
          locales[item][key] = '';
        }
      });
    }
  });

  fs.writeFileSync(filePath, fileContent, 'utf-8');
};

// 生成语言文件
const generateLocaleFiles = (locales, existingLocales) => {
  const localeDir = path.join(__dirname, 'src/locales');

  if (!fs.existsSync(localeDir)) {
    fs.mkdirSync(localeDir);
  }

  // 合并语言文件
  const mergeWithPriority = (existing, newLocales) => {
    const result = { ...existing };

    Object.keys(newLocales).forEach(key => {
      // 如果新的值非空，则优先使用新的值，否则保留旧的值
      if (newLocales[key] && newLocales[key].trim() !== '') {
        result[key] = newLocales[key];
      } else if (existing[key] && existing[key].trim() !== '') {
        result[key] = existing[key];
      } else {
        result[key] = '';
      }
    });

    return result;
  };

  ['zh_CN', 'en_US', 'zh_HK'].forEach(lang => {
    const filePath = path.join(localeDir, `${lang}.json`);

    // 合并现有的 locales 和新的 locales
    const mergedLocales = mergeWithPriority(existingLocales[lang], locales[lang]);

    const sortedLocales = Object.keys(mergedLocales)
      .sort()
      .reduce((acc, key) => {
        acc[key] = mergedLocales[key];
        return acc;
      }, {});

    fs.writeFileSync(filePath, JSON.stringify(sortedLocales, null, 2), 'utf-8');
  });
};

// 清理不存在的key值并确保翻译文件中key的一致性
const clearInvalidKeys = () => {
  console.log('开始清理无效的国际化key...');
  const localeDir = path.join(__dirname, 'src/locales');

  // 加载现有的 locales 文件内容
  const existingLocales = loadExistingLocales(localeDir);

  // 收集所有源文件中使用的key
  const usedKeys = new Set();
  const extensions = ['.js', '.ts', '.tsx']; // 要处理的文件后缀
  const srcDir = path.join(__dirname, 'src');

  // 遍历所有源文件
  const files = traverseDirectory(srcDir, extensions);

  // 用于匹配所有$t调用的正则表达式
  const keyRegexes = [
    // 基本匹配，应该能匹配大多数情况
    /\$t\(\s*['"]([^'"]+)['"]\s*(?:,[\s\S]*?)?\)/g,

    // 专门匹配单行的情况
    /\$t\(['"]([^'"]+)['"],\s*['"][^'"]*['"](?:\s*,\s*\{[^}]*\})?\)/g,

    // 专门匹配多行的情况
    /\$t\(\s*['"]([^'"]+)['"]\s*,\s*['"][^'"]*['"][\s\S]*?\)/g,
  ];

  // 用于调试的计数器
  const matchCounts = {
    total: 0,
    byRegex: [0, 0, 0],
  };

  files.forEach(file => {
    const fileContent = fs.readFileSync(file, 'utf-8');

    // 对每个正则表达式进行匹配
    keyRegexes.forEach((regex, index) => {
      let match;
      while ((match = regex.exec(fileContent)) !== null) {
        const key = match[1];
        // 验证key格式是否符合 module.file.hash 格式
        if (/^[\w\-]+\.[\w\-]+\.[a-zA-Z0-9]{6}$/.test(key)) {
          usedKeys.add(key);
          matchCounts.total++;
          matchCounts.byRegex[index]++;
        }
      }
    });
  });

  console.log(`匹配统计: 总计 ${matchCounts.total} 个匹配`);
  console.log(`正则表达式 #1: ${matchCounts.byRegex[0]} 个匹配`);
  console.log(`正则表达式 #2: ${matchCounts.byRegex[1]} 个匹配`);
  console.log(`正则表达式 #3: ${matchCounts.byRegex[2]} 个匹配`);
  console.log(`在源代码中找到 ${usedKeys.size} 个使用中的key`);

  // 统计每种语言文件中的key数量
  Object.keys(existingLocales).forEach(lang => {
    console.log(`${lang} 语言文件中有 ${Object.keys(existingLocales[lang]).length} 个key`);
  });

  // 清理不存在的key
  const cleanedLocales = {};
  Object.keys(existingLocales).forEach(lang => {
    cleanedLocales[lang] = {};

    // 只保留使用中的key
    usedKeys.forEach(key => {
      if (existingLocales[lang][key] !== undefined) {
        cleanedLocales[lang][key] = existingLocales[lang][key];
      } else if (lang !== 'zh_CN' && existingLocales.zh_CN[key]) {
        // 如果其他语言没有这个key但中文有，则添加空值
        cleanedLocales[lang][key] = '';
      }
    });
  });

  // 确保所有语言文件包含相同的key
  const allKeys = new Set();
  Object.values(cleanedLocales).forEach(locale => {
    Object.keys(locale).forEach(key => allKeys.add(key));
  });

  allKeys.forEach(key => {
    Object.keys(cleanedLocales).forEach(lang => {
      if (cleanedLocales[lang][key] === undefined) {
        cleanedLocales[lang][key] = '';
      }
    });
  });

  // 统计清理后每种语言文件中的key数量
  Object.keys(cleanedLocales).forEach(lang => {
    console.log(`清理后 ${lang} 语言文件中有 ${Object.keys(cleanedLocales[lang]).length} 个key`);
  });

  // 写入清理后的语言文件
  Object.keys(cleanedLocales).forEach(lang => {
    const filePath = path.join(localeDir, `${lang}.json`);

    // 按key排序
    const sortedLocales = Object.keys(cleanedLocales[lang])
      .sort()
      .reduce((acc, key) => {
        acc[key] = cleanedLocales[lang][key];
        return acc;
      }, {});

    fs.writeFileSync(filePath, JSON.stringify(sortedLocales, null, 2), 'utf-8');
  });

  console.log('语言文件清理完成！');
};

// 自动翻译函数
const translateLocales = async () => {
  console.log('开始自动翻译...');
  const localeDir = path.join(__dirname, 'src/locales');

  // 加载现有的 locales 文件内容
  const existingLocales = loadExistingLocales(localeDir);

  // 检查中文文件是否存在
  if (!existingLocales.zh_CN || Object.keys(existingLocales.zh_CN).length === 0) {
    console.error('错误：中文语言文件不存在或为空，无法进行翻译');
    return;
  }

  // 需要翻译的目标语言
  const targetLanguages = {
    en_US: 'en', // 中文到英文
    zh_HK: 'yue', // 中文到粤语/繁体
  };

  // 统计需要翻译的条目数
  const needTranslation = {};
  Object.keys(targetLanguages).forEach(lang => {
    needTranslation[lang] = 0;
    Object.keys(existingLocales.zh_CN).forEach(key => {
      if (!existingLocales[lang][key] || existingLocales[lang][key] === '') {
        needTranslation[lang]++;
      }
    });
    console.log(`${lang} 需要翻译 ${needTranslation[lang]} 个条目`);
  });

  // 如果没有需要翻译的内容，直接返回
  if (Object.values(needTranslation).every(count => count === 0)) {
    console.log('没有需要翻译的内容');
    return;
  }

  // 确认是否继续翻译
  console.log('注意：自动翻译将调用第三方API，可能产生费用。请确保已配置正确的API密钥。');
  console.log('继续进行自动翻译...');

  try {
    // 遍历每种目标语言
    for (const [langCode, targetLang] of Object.entries(targetLanguages)) {
      console.log(`开始翻译 ${langCode}...`);
      let translatedCount = 0;

      // 批量处理翻译，每次最多100个
      const batchSize = 100;
      const keys = Object.keys(existingLocales.zh_CN).filter(
        key => !existingLocales[langCode][key] || existingLocales[langCode][key] === '',
      );

      for (let i = 0; i < keys.length; i += batchSize) {
        const batchKeys = keys.slice(i, i + batchSize);
        const batchTexts = batchKeys.map(key => existingLocales.zh_CN[key]);

        try {
          // 这里使用百度翻译API作为示例
          // 实际使用时需要替换为您的API密钥和正确的API调用方式
          // const response = await axios.post('https://api.fanyi.baidu.com/api/trans/vip/translate', {
          //   q: batchTexts.join('\n'),
          //   from: 'zh',
          //   to: targetLang,
          //   appid: 'YOUR_APP_ID',
          //   salt: Date.now(),
          //   sign: 'YOUR_SIGN_LOGIC'
          // });

          // 模拟翻译结果，实际使用时应替换为真实API调用
          console.log(`模拟翻译批次 ${i / batchSize + 1}/${Math.ceil(keys.length / batchSize)}`);

          // 在实际实现中，这里应该解析API响应并获取翻译结果
          // const translatedTexts = response.data.trans_result.map(item => item.dst);

          // 模拟翻译结果，实际使用时应替换为API返回的结果
          const translatedTexts = batchTexts.map(text => `[${langCode}] ${text}`);

          // 将翻译结果写入到对应的语言文件中
          batchKeys.forEach((key, index) => {
            existingLocales[langCode][key] = translatedTexts[index];
            translatedCount++;
          });

          // 避免API请求过于频繁
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`翻译批次出错:`, error.message);
        }
      }

      console.log(`${langCode} 翻译完成，共翻译 ${translatedCount} 个条目`);
    }

    // 保存翻译后的语言文件
    Object.keys(existingLocales).forEach(lang => {
      const filePath = path.join(localeDir, `${lang}.json`);

      // 按key排序
      const sortedLocales = Object.keys(existingLocales[lang])
        .sort()
        .reduce((acc, key) => {
          acc[key] = existingLocales[lang][key];
          return acc;
        }, {});

      fs.writeFileSync(filePath, JSON.stringify(sortedLocales, null, 2), 'utf-8');
    });

    console.log('翻译完成并保存到语言文件！');
  } catch (error) {
    console.error('翻译过程中出错:', error.message);
  }
};

// OBS工具类，处理公共逻辑
class ObsHandler {
  constructor() {
    this.obsConfig = {
      access: '',
      secret: '',
      endPoint: '',
      cdnEndPoint: '',
      bucketName: '',
    };

    this.fileNames = ['zh_CN.json', 'en_US.json', 'zh_HK.json'];
    this.localeDir = path.join(__dirname, 'src/locales');
    this.obsClient = null;
    this.projectName = 'ai-tools'; // 默认项目名称
  }

  // 初始化OBS客户端
  async init() {
    try {
      const ObsClient = require('esdk-obs-nodejs');
      this.obsClient = new ObsClient({
        access_key_id: this.obsConfig.access,
        secret_access_key: this.obsConfig.secret,
        server: `https://${this.obsConfig.endPoint}`,
      });

      // 读取项目名称
      try {
        const packageJsonPath = path.join(__dirname, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          this.projectName = packageJson.name || this.projectName;
        }
      } catch (error) {
        console.warn('警告：无法读取package.json文件，使用默认项目名称');
      }

      return true;
    } catch (error) {
      console.error('错误：缺少esdk-obs-nodejs依赖，请先安装：npm install esdk-obs-nodejs');
      return false;
    }
  }

  // 确保本地目录存在
  ensureLocalDir() {
    if (!fs.existsSync(this.localeDir)) {
      fs.mkdirSync(this.localeDir, { recursive: true });
    }
  }

  // 获取OBS文件路径
  getObsPath(version, fileName) {
    return `lang/${this.projectName}/${version}/${fileName}`;
  }

  // 上传单个文件
  uploadFile(version, fileName, fileContent) {
    return new Promise((resolve, reject) => {
      this.obsClient.putObject(
        {
          Bucket: this.obsConfig.bucketName,
          Key: this.getObsPath(version, fileName),
          Body: fileContent,
        },
        (err, result) => {
          if (err) {
            console.error(`上传 ${fileName} 出错:`, err);
            reject(false);
          } else {
            if (result.CommonMsg.Status < 300) {
              console.log(`${fileName} 上传成功`);
              resolve(true);
            } else {
              console.error(`上传 ${fileName} 失败:`, result.CommonMsg.Status);
              reject(false);
            }
          }
        },
      );
    });
  }

  // 下载单个文件
  downloadFile(version, fileName) {
    return new Promise((resolve, reject) => {
      const obsPath = this.getObsPath(version, fileName);
      console.log(`正在下载 ${obsPath}...`);

      this.obsClient.getObject(
        {
          Bucket: this.obsConfig.bucketName,
          Key: obsPath,
        },
        (err, result) => {
          if (err) {
            console.error(`下载 ${fileName} 出错:`, err);
            reject(false);
            return;
          }

          if (result.CommonMsg.Status < 300) {
            const content = result.InterfaceResult.Content;
            const localPath = path.join(this.localeDir, fileName);

            try {
              // 验证JSON格式
              const jsonContent = JSON.parse(content.toString());
              // 格式化并保存文件
              fs.writeFileSync(localPath, JSON.stringify(jsonContent, null, 2), 'utf-8');
              console.log(`${fileName} 下载成功并保存到: ${localPath}`);
              resolve(true);
            } catch (error) {
              console.error(`解析 ${fileName} 内容失败:`, error.message);
              reject(false);
            }
          } else {
            console.error(`下载 ${fileName} 失败: HTTP ${result.CommonMsg.Status}`);
            reject(false);
          }
        },
      );
    });
  }

  // 处理所有文件的上传或下载
  async handleFiles(version, isUpload = true) {
    if (!version) {
      console.error('错误：缺少版本号参数，请提供有效的版本号');
      return;
    }

    console.log(`开始${isUpload ? '上传' : '下载'}翻译文件，版本号: ${version}...`);
    console.log(`项目名称: ${this.projectName}`);

    try {
      // 确保本地目录存在
      this.ensureLocalDir();

      let promises;
      if (isUpload) {
        // 读取本地文件并上传
        const fileList = this.fileNames
          .map(fileName => {
            const filePath = path.join(this.localeDir, fileName);
            if (fs.existsSync(filePath)) {
              return {
                fileName,
                data: fs.readFileSync(filePath, 'utf-8'),
              };
            }
            console.warn(`警告：找不到翻译文件 ${fileName}`);
            return null;
          })
          .filter(Boolean);

        if (fileList.length === 0) {
          console.error('错误：没有找到任何翻译文件');
          return;
        }

        console.log(`找到 ${fileList.length} 个翻译文件，准备上传...`);
        promises = fileList.map(file => this.uploadFile(version, file.fileName, file.data));
      } else {
        // 下载文件
        promises = this.fileNames.map(fileName => this.downloadFile(version, fileName));
      }

      // 等待所有操作完成
      const results = await Promise.all(promises.map(p => p.catch(e => e)));
      const success = results.every(result => result === true);

      if (success) {
        console.log(`所有翻译文件${isUpload ? '上传' : '下载'}成功！`);
        if (isUpload) {
          console.log(`OBS保存路径为: lang/${this.projectName}/${version}/`);
        } else {
          console.log(`文件已保存到: ${this.localeDir}`);
        }
      } else {
        console.error(`部分或全部翻译文件${isUpload ? '上传' : '下载'}失败`);
      }
    } catch (error) {
      console.error(`${isUpload ? '上传' : '下载'}过程中出错:`, error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }
}

// 上传翻译文件到OBS云服务器
const uploadToObs = async version => {
  const handler = new ObsHandler();
  if (await handler.init()) {
    await handler.handleFiles(version, true);
  }
};

// 从OBS下载翻译文件并覆盖本地文件
const downloadFromObs = async version => {
  const handler = new ObsHandler();
  if (await handler.init()) {
    await handler.handleFiles(version, false);
  }
};

// 主函数
const main = () => {
  const args = process.argv.slice(2);

  // 检查是否有clear参数
  if (args.includes('clear')) {
    clearInvalidKeys();
    return;
  }

  // 检查是否有translate参数
  if (args.includes('translate')) {
    translateLocales();
    return;
  }

  // 检查是否有upload参数
  const uploadIndex = args.indexOf('upload');
  if (uploadIndex !== -1) {
    // 获取版本号参数
    const version = args[uploadIndex + 1];
    if (!version) {
      console.error('错误：使用upload命令时必须提供版本号参数');
      console.log('用法示例: node language.js upload 1.0.0');
      return;
    }
    uploadToObs(version);
    return;
  }

  // 检查是否有download参数
  const downloadIndex = args.indexOf('download');
  if (downloadIndex !== -1) {
    // 获取版本号参数
    const version = args[downloadIndex + 1];
    if (!version) {
      console.error('错误：使用download命令时必须提供版本号参数');
      console.log('用法示例: node language.js download 1.0.0');
      return;
    }
    downloadFromObs(version);
    return;
  }

  const inputPath = args[0] || 'src'; // 用户输入路径或默认 src 目录
  const defaultLang = args[1] || 'en_US'; // 设定默认语言
  const extensions = ['.js', '.ts', '.tsx']; // 要处理的文件后缀
  const localeDir = path.join(__dirname, 'src/locales');

  // 加载现有的 locales 文件内容
  const existingLocales = loadExistingLocales(localeDir);

  const locales = {
    zh_CN: {},
    en_US: {},
    zh_HK: {},
  };

  let files = [];
  const stats = fs.statSync(inputPath);

  if (stats.isDirectory()) {
    files = traverseDirectory(inputPath, extensions);
  } else if (extensions.includes(path.extname(inputPath))) {
    files.push(inputPath);
  }

  files.forEach(file => processFile(file, locales, existingLocales, defaultLang));
  generateLocaleFiles(locales, existingLocales);

  console.log('翻译文案处理完成，语言文件已生成！');
};

main();
