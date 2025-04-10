export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-prettier', 'stylelint-order', "stylelint-less"],
  customSyntax: 'postcss-less',
  rules: {
    "media-query-no-invalid": null,
    "media-feature-name-no-unknown": [
      true,
      {
        "ignoreMediaFeatureNames": ["min-device-pixel-ratio", "-webkit-device-pixel-ratio"]
      }
    ],
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep'],
      },
    ],
    'at-rule-no-unknown': null,
    'no-empty-source': null,
    'named-grid-areas-no-invalid': null,
    'no-descending-specificity': null,
    'font-family-no-missing-generic-family-keyword': null,
    'rule-empty-line-before': [
      'always',
      {
        ignore: ['after-comment', 'first-nested'],
      },
    ],
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'display',
      'flex',
      'flex-direction',
      'flex-wrap',
      'justify-content',
      'align-items',
      'width',
      'height',
      'margin',
      'padding',
      'background',
      'border',
      'font',
      'color',
    ],
  },
};
