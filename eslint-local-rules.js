const FEATURE_COMPONENT_PROPS_RULE = 'feature-component-props'
const NO_EMPTY_PROMISE_CATCH_RULE = 'no-empty-promise-catch'

function isPropsInterfaceName(name) {
  return name === 'Props' || name.endsWith('Props')
}

function isUndefinedExpression(node) {
  return (
    (node.type === 'Identifier' && node.name === 'undefined') ||
    (node.type === 'UnaryExpression' &&
      node.operator === 'void' &&
      node.argument.type === 'Literal' &&
      node.argument.value === 0)
  )
}

function isEmptyCatchHandler(node) {
  if (
    node.type !== 'ArrowFunctionExpression' &&
    node.type !== 'FunctionExpression'
  ) {
    return false
  }

  if (node.body.type !== 'BlockStatement') {
    return isUndefinedExpression(node.body)
  }

  if (node.body.body.length === 0) {
    return true
  }

  return (
    node.body.body.length === 1 &&
    node.body.body[0].type === 'ReturnStatement' &&
    node.body.body[0].argument !== null &&
    isUndefinedExpression(node.body.body[0].argument)
  )
}

function isPromiseCatchCall(node) {
  return (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'catch'
  )
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

const noEmptyPromiseCatch = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow empty promise catch callbacks that silently swallow failures.',
    },
    messages: {
      emptyCatch:
        'Do not silently swallow promise failures with an empty catch callback. Handle the error, log it, or make the async function own expected failures and call it with void.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isPromiseCatchCall(node)) {
          return
        }

        const [handler] = node.arguments

        if (!handler || !isEmptyCatchHandler(handler)) {
          return
        }

        context.report({
          messageId: 'emptyCatch',
          node: handler,
        })
      },
    }
  },
}

export const localRulesPlugin = {
  rules: {
    [FEATURE_COMPONENT_PROPS_RULE]: featureComponentProps,
    [NO_EMPTY_PROMISE_CATCH_RULE]: noEmptyPromiseCatch,
  },
}
