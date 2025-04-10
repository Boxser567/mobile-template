import type { FC } from 'react';
import type { MessageDescriptor } from 'react-intl';

import { createIntl, createIntlCache, FormattedMessage, useIntl } from 'react-intl';

import en_US from './en_US.json';
import zh_CN from './zh_CN.json';
import zh_HK from './zh_HK.json';

export const localeConfig: any = {
  zh_CN,
  zh_HK,
  en_US,
};

type Id = keyof typeof en_US;

interface Props extends MessageDescriptor {
  id: Id;
  values?: any;
}

// 创建缓存实例
const cache = createIntlCache();

// 公共方法：创建 intl 实例

const getIntlInstance = () => {
  const locale = localStorage.getItem('locale') || 'en_US';

  return createIntl(
    {
      locale: 'en-US',
      messages: localeConfig[locale] || {},
    },
    cache,
  );
};

// 公共方法：翻译文案
export const translateMessage = (id: string, description?: string) => {
  return getIntlInstance().formatMessage({ id });
};

export const LocaleFormatter: FC<Props> = ({ ...props }) => {
  const notChildProps = { ...props, children: undefined };

  return <FormattedMessage {...notChildProps} id={props.id} />;
};

type PrimitiveType = string | number | boolean | null | undefined;
type FormatXMLElementFn<T, R> = (parts: T) => R;

type FormatMessageProps = (
  id: string,
  text?: string,
  values?: Record<string, PrimitiveType | FormatXMLElementFn<any, any>>,
) => string;

export const useLocale = () => {
  const { formatMessage, ...rest } = useIntl();

  const $t: FormatMessageProps = (id, text, values = {}) => {
    const result = formatMessage({ id }, values);

    if (Array.isArray(result)) {
      return result.join('');
    }

    return result as string;
  };

  return {
    ...rest,
    formatMessage,
    $t,
  };
};
