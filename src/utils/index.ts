export function generateRandomString(length: number = 10) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

// get 请求特殊字符[、]接口查询异常
export const encodeReplace = (data: any) => {
  for (const key in data) {
    if (typeof data[key] === 'string') {
      data[key] = data[key].replace(/\[|]/g, '');
    }
  }

  return data;
};

/** microsoft预览office文件 */
export const previewOfficeByMS = (fileUrl: string) => {
  // https://www.microsoft.com/en-us/microsoft-365/blog/2013/04/10/office-web-viewer-view-office-documents-in-a-browser/
  window.open('//view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(fileUrl));
};

export const isNotEmpty = (value: unknown) => {
  switch (typeof value) {
    case 'undefined': {
      return false;
    }

    case 'string': {
      return value.length !== 0;
    }

    case 'object': {
      if (Array.isArray(value)) {
        return value.length !== 0;
      } else if (value === null) {
        return false;
      } else {
        return Object.keys(value).length !== 0;
      }
    }

    default: {
      return true;
    }
  }
};

export const regs = {
  url: '^(http|https|ftp)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]',
  email: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
  mobile: /^1[3|4|5|6|7|8|9][0-9]{9}$/,
  //mobile: /^\d{1,17}$/,
  idCard: /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/,
  currency: '^d+(.d+)?$',
  qq: '^[1-9]d{4,8}$',
  number: '^[1-9][0-9]*$',
  positiveInt: '^[1-9]d*$',
  zip: '^[1-9]d{5}$',
  double: '^[-+]?d+(.d+)?$',
  english: '^[A-Za-z]+$',
  chinese: /^[\u4e00-\u9fa5]+$/,
  unSafe: '^(.{0,5})$|s',
  // phone: '^(0\\d{2}-\\d{8})|(0\\d{3}-\\d{7})|(1[3|4|5|7|8][0-9]{9})$',
  phone: /^\d{1,17}$/,
  time: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
  date: '(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)',
  testCode: /^\d{4}$/,
  password: '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,20}$',
  passwordReg: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/,
};

export const StringToBase64 = (str: string) => {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    let binary = '';

    for (let i = 0; i < str.length; i++) {
      binary += String.fromCharCode(str.charCodeAt(i));
    }

    return window.btoa(binary);
  } else {
    throw new Error('Base64 encoding not supported in this environment.');
  }
};
