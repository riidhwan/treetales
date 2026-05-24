const FEATURE_COMPONENT_PROPS_RULE = 'feature-component-props'

function isPropsInterfaceName(name) {
  return name === 'Props' || name.endsWith('Props')
}

const featureComponentProps = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require feature component TSX files to expose at most one Props interface named exactly Props.',
    },
    messages: {
      duplicateProps:
        'Feature component files may declare only one Props interface. Split additional components into separate files.',
      namedProps:
        'Feature component prop interfaces must be named Props. Split {{name}} into its own component file with interface Props.',
    },
    schema: [],
  },
  create(context) {
    let hasPropsInterface = false

    return {
      TSInterfaceDeclaration(node) {
        const name = node.id.name

        if (!isPropsInterfaceName(name)) {
          return
        }

        if (name !== 'Props') {
          context.report({
            data: { name },
            messageId: 'namedProps',
            node: node.id,
          })
          return
        }

        if (hasPropsInterface) {
          context.report({
            messageId: 'duplicateProps',
            node: node.id,
          })
          return
        }

        hasPropsInterface = true
      },
    }
  },
}

export const localRulesPlugin = {
  rules: {
    [FEATURE_COMPONENT_PROPS_RULE]: featureComponentProps,
  },
}
