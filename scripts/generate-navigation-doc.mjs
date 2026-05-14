import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

const ROOT = process.cwd()
const ROUTES_DIR = path.join(ROOT, 'src/routes')
const FEATURES_DIR = path.join(ROOT, 'src/components/features')
const OUTPUT_PATH = path.join(ROOT, 'docs/navigation-flow.md')

const ROUTE_TITLE_BY_PATH = new Map([
  ['/', 'Home / Story Dashboard'],
  ['/stories/$storyId/read', 'Story Reader'],
  ['/stories/$storyId/edit', 'Story Editor'],
  ['/stories/$storyId/chapters/new', 'Intro Chapter Creator'],
  [
    '/stories/$storyId/chapters/$chapterId/edit',
    'Chapter Editor',
  ],
  [
    '/stories/$storyId/chapters/$chapterId/children/new',
    'Child Chapter Creator',
  ],
])

const RUNTIME_NOTES_BY_ROUTE = new Map([
  [
    '/',
    [
      '`Install App` starts the PWA install flow when the mobile install choice is visible; it does not change routes.',
      '`Continue to Mobile Site` dismisses the install choice in the browser and shows the dashboard at the same URL.',
      '`Create Story` creates a story and opens `/stories/$storyId/edit` through the dashboard hook.',
      '`Add Example Story` creates or reuses the example story and opens it in the reader.',
      '`New Story` only opens the creation form.',
      '`Delete` asks for confirmation and removes the story without navigation.',
    ],
  ],
  [
    '/stories/$storyId/read',
    [
      '`Back`, `Continue`, and branch choice buttons update the `chapterId` search parameter on the reader route.',
      'Branch choice labels are chapter titles from IndexedDB, so their labels are data-driven.',
      '`The End` is an indicator, not a navigation control.',
    ],
  ],
  [
    '/stories/$storyId/edit',
    [
      '`Save Story` persists title and description without changing routes.',
      '`Add Intro Chapter` only appears when the story has no intro chapter.',
    ],
  ],
  [
    '/stories/$storyId/chapters/new',
    [
      '`Create Chapter` creates the intro chapter and then opens `/stories/$storyId/chapters/$chapterId/edit`.',
    ],
  ],
  [
    '/stories/$storyId/chapters/$chapterId/children/new',
    [
      '`Create Chapter` creates a child chapter and then opens `/stories/$storyId/chapters/$chapterId/edit` for the new chapter.',
    ],
  ],
  [
    '/stories/$storyId/chapters/$chapterId/edit',
    ['`Save Chapter` persists title and content without changing routes.'],
  ],
])

const ACTION_SUMMARY_BY_CALLBACK = new Map([
  ['createExampleStoryFromTemplate', 'Creates or opens the example story'],
  ['createStoryFromForm', 'Creates a story from the form'],
  ['deleteStoryWithConfirmation', 'Confirms and deletes the story'],
  ['installApp', 'Starts PWA install flow'],
  ['continueToMobileSite', 'Dismisses mobile install choice'],
  ['saveStory', 'Saves story details'],
  ['saveChapter', 'Saves chapter details'],
  ['createChapterFromForm', 'Creates a chapter from the form'],
  ['selectPreviousChapter', 'Moves to the previous reader chapter'],
  ['selectNextChapter', 'Moves to a reader chapter'],
  ['setIsFormOpen', 'Opens the story creation form'],
])

async function listFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        return listFiles(entryPath, extension)
      }

      return entry.name.endsWith(extension) ? [entryPath] : []
    }),
  )

  return nested.flat()
}

async function parseSourceFile(filePath) {
  const source = await readFile(filePath, 'utf8')

  return ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true)
}

function walk(node, visitor) {
  visitor(node)
  ts.forEachChild(node, (child) => walk(child, visitor))
}

function getJsxTagName(tagName) {
  if (ts.isIdentifier(tagName)) {
    return tagName.text
  }

  if (ts.isPropertyAccessExpression(tagName)) {
    return tagName.name.text
  }

  return undefined
}

function getStringLiteral(node) {
  return ts.isStringLiteralLike(node) ? node.text : undefined
}

function getAttribute(openingElement, name) {
  return openingElement.attributes.properties.find(
    (attribute) =>
      ts.isJsxAttribute(attribute) &&
      ts.isIdentifier(attribute.name) &&
      attribute.name.text === name,
  )
}

function getAttributeExpression(attribute) {
  if (!attribute || !ts.isJsxAttribute(attribute) || !attribute.initializer) {
    return undefined
  }

  if (ts.isJsxExpression(attribute.initializer)) {
    return attribute.initializer.expression
  }

  return undefined
}

function getAttributeText(attribute) {
  if (!attribute || !ts.isJsxAttribute(attribute) || !attribute.initializer) {
    return undefined
  }

  if (ts.isStringLiteral(attribute.initializer)) {
    return attribute.initializer.text
  }

  const expression = getAttributeExpression(attribute)

  return expression ? expression.getText() : undefined
}

function collectTextFromJsx(node) {
  const parts = []

  function collect(child) {
    if (ts.isJsxText(child)) {
      const text = child.getText().replace(/\s+/g, ' ').trim()

      if (text) {
        parts.push(text)
      }

      return
    }

    if (ts.isJsxExpression(child) && child.expression) {
      const expression = child.expression

      if (ts.isStringLiteralLike(expression)) {
        parts.push(expression.text)
      } else if (ts.isConditionalExpression(expression)) {
        parts.push(getStringOptions(expression).join(' / '))
      } else if (
        ts.isPropertyAccessExpression(expression) ||
        ts.isIdentifier(expression)
      ) {
        parts.push(`{${expression.getText()}}`)
      }

      return
    }

    if (ts.isJsxElement(child)) {
      child.children.forEach(collect)
      return
    }

    if (ts.isJsxSelfClosingElement(child)) {
      const ariaLabel = getAttributeText(
        getAttribute(child, 'aria-label'),
      )

      if (ariaLabel) {
        parts.push(ariaLabel)
      }
    }
  }

  if (ts.isJsxElement(node)) {
    node.children.forEach(collect)
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim() || 'Unlabelled control'
}

function getStringOptions(node) {
  const options = []

  walk(node, (child) => {
    if (ts.isStringLiteralLike(child)) {
      options.push(child.text)
    }
  })

  return [...new Set(options)]
}

function findCallNames(node) {
  const callNames = []

  walk(node, (child) => {
    if (!ts.isCallExpression(child)) {
      return
    }

    const { expression } = child

    if (ts.isIdentifier(expression)) {
      callNames.push(expression.text)
    } else if (ts.isPropertyAccessExpression(expression)) {
      callNames.push(expression.name.text)
    }
  })

  return [...new Set(callNames)]
}

function findFirstNavigateTarget(node) {
  let target

  walk(node, (child) => {
    if (target || !ts.isCallExpression(child)) {
      return
    }

    const callee = child.expression
    const isNavigateCall =
      ts.isIdentifier(callee) && callee.text === 'navigate'

    if (!isNavigateCall) {
      return
    }

    const [argument] = child.arguments

    if (!argument || !ts.isObjectLiteralExpression(argument)) {
      return
    }

    const to = getObjectStringProperty(argument, 'to')
    const hasSearch = argument.properties.some(
      (property) =>
        ts.isPropertyAssignment(property) &&
        ts.isIdentifier(property.name) &&
        property.name.text === 'search',
    )

    if (to) {
      target = to
    } else if (hasSearch) {
      target = 'same route with updated search parameters'
    }
  })

  return target
}

function getObjectStringProperty(objectLiteral, propertyName) {
  for (const property of objectLiteral.properties) {
    if (
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === propertyName &&
      ts.isStringLiteralLike(property.initializer)
    ) {
      return property.initializer.text
    }
  }

  return undefined
}

function getCallbackNames(expression) {
  if (!expression) {
    return []
  }

  if (ts.isIdentifier(expression)) {
    return [expression.text]
  }

  if (ts.isCallExpression(expression)) {
    return findCallNames(expression)
  }

  if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) {
    return findCallNames(expression.body)
  }

  return findCallNames(expression)
}

function getCallbackName(expression) {
  const [callbackName] = getCallbackNames(expression)

  return callbackName
}

function getRoutePaths(sourceFile) {
  const paths = []

  walk(sourceFile, (node) => {
    if (!ts.isCallExpression(node)) {
      return
    }

    const expression = node.expression
    const isCreateFileRoute =
      ts.isIdentifier(expression) && expression.text === 'createFileRoute'

    if (!isCreateFileRoute) {
      return
    }

    const [routePath] = node.arguments
    const routePathText = routePath && getStringLiteral(routePath)

    if (routePathText) {
      paths.push(routePathText)
    }
  })

  return paths
}

function getRouteComponentName(sourceFile, componentNames) {
  let componentName

  walk(sourceFile, (node) => {
    if (componentName || !ts.isJsxOpeningLikeElement(node)) {
      return
    }

    const name = getJsxTagName(node.tagName)

    if (name && componentNames.has(name)) {
      componentName = name
    }
  })

  return componentName
}

function getRouteCallbackTargets(sourceFile) {
  const callbackTargets = new Map()

  walk(sourceFile, (node) => {
    if (!ts.isJsxOpeningLikeElement(node)) {
      return
    }

    for (const property of node.attributes.properties) {
      if (
        !ts.isJsxAttribute(property) ||
        !ts.isIdentifier(property.name) ||
        !property.name.text.startsWith('on')
      ) {
        continue
      }

      const expression = getAttributeExpression(property)

      if (!expression) {
        continue
      }

      const target = findFirstNavigateTarget(expression)

      if (target) {
        callbackTargets.set(property.name.text, target)
      }
    }
  })

  return callbackTargets
}

function getFunctionComponentName(node) {
  if (
    ts.isFunctionDeclaration(node) &&
    node.name &&
    /^[A-Z]/.test(node.name.text)
  ) {
    return node.name.text
  }

  if (ts.isVariableStatement(node)) {
    for (const declaration of node.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        /^[A-Z]/.test(declaration.name.text) &&
        declaration.initializer &&
        (ts.isArrowFunction(declaration.initializer) ||
          ts.isFunctionExpression(declaration.initializer))
      ) {
        return declaration.name.text
      }
    }
  }

  return undefined
}

function getButtonAction(openingElement, element) {
  const label = collectTextFromJsx(element)
  const onClick = getAttribute(openingElement, 'onClick')
  const type = getAttributeText(getAttribute(openingElement, 'type'))
  const callbackNames = getCallbackNames(getAttributeExpression(onClick))
  const [callbackName] = callbackNames
  const fallback = getButtonFallback(callbackName, type)

  return {
    callbackName,
    callbackNames,
    element: 'button',
    fallback,
    label,
  }
}

function getButtonFallback(callbackName, type) {
  if (callbackName) {
    return ACTION_SUMMARY_BY_CALLBACK.get(callbackName) ?? `Calls \`${callbackName}\``
  }

  if (type === 'submit') {
    return 'Submits the enclosing form'
  }

  return 'No route-changing action detected'
}

function getAnchorAction(openingElement, element) {
  const label = collectTextFromJsx(element)
  const hrefAttribute = getAttribute(openingElement, 'href')
  const href = getStaticHref(hrefAttribute)
  const fallback =
    href ?? getDynamicHrefFallback(hrefAttribute) ?? 'No href detected'

  return {
    callbackName: undefined,
    element: 'link',
    fallback,
    label,
    target: href,
  }
}

function getStaticHref(attribute) {
  if (!attribute || !ts.isJsxAttribute(attribute) || !attribute.initializer) {
    return undefined
  }

  if (ts.isStringLiteral(attribute.initializer)) {
    return attribute.initializer.text
  }

  return undefined
}

function getDynamicHrefFallback(attribute) {
  const expression = getAttributeExpression(attribute)

  return expression ? `Dynamic href \`{${expression.getText()}}\`` : undefined
}

function getChildUsage(openingElement, componentNames) {
  const childName = getJsxTagName(openingElement.tagName)

  if (!childName || !componentNames.has(childName)) {
    return undefined
  }

  const propMap = new Map()

  for (const property of openingElement.attributes.properties) {
    if (!ts.isJsxAttribute(property) || !ts.isIdentifier(property.name)) {
      continue
    }

    const expression = getAttributeExpression(property)

    if (expression && ts.isIdentifier(expression)) {
      propMap.set(property.name.text, expression.text)
    } else if (expression) {
      const callbackName = getCallbackName(expression)

      if (callbackName) {
        propMap.set(property.name.text, callbackName)
      }
    }
  }

  return { childName, propMap }
}

async function getFeatureComponents() {
  const files = await listFiles(FEATURES_DIR, '.tsx')
  const sourceFiles = await Promise.all(
    files.map(async (file) => ({
      file,
      sourceFile: await parseSourceFile(file),
    })),
  )
  const componentNames = new Set()

  for (const { sourceFile } of sourceFiles) {
    walk(sourceFile, (node) => {
      const componentName = getFunctionComponentName(node)

      if (componentName) {
        componentNames.add(componentName)
      }
    })
  }

  const components = new Map()

  for (const { file, sourceFile } of sourceFiles) {
    sourceFile.statements.forEach((statement) => {
      const componentName = getFunctionComponentName(statement)

      if (!componentName) {
        return
      }

      const actions = []
      const childUsages = []

      walk(statement, (node) => {
        if (ts.isJsxElement(node)) {
          const opening = node.openingElement
          const tagName = getJsxTagName(opening.tagName)

          if (tagName === 'Button') {
            actions.push(getButtonAction(opening, node))
          } else if (tagName === 'a') {
            actions.push(getAnchorAction(opening, node))
          }

          const childUsage = getChildUsage(opening, componentNames)

          if (childUsage && childUsage.childName !== componentName) {
            childUsages.push(childUsage)
          }
        } else if (ts.isJsxSelfClosingElement(node)) {
          const childUsage = getChildUsage(node, componentNames)

          if (childUsage && childUsage.childName !== componentName) {
            childUsages.push(childUsage)
          }
        }
      })

      components.set(componentName, {
        actions,
        childUsages,
        file,
        name: componentName,
      })
    })
  }

  return { componentNames, components }
}

function collectComponentActions(
  routePath,
  componentName,
  components,
  callbackTargets,
  seen = new Set(),
) {
  const component = components.get(componentName)

  if (!component || seen.has(componentName)) {
    return []
  }

  seen.add(componentName)

  const actions = component.actions.map((action) =>
    normalizeRouteAction(routePath, {
      component: componentName,
      destination: getActionDestination(action, callbackTargets),
      label: action.label,
      note: getActionNote(action, callbackTargets),
    }),
  )

  for (const childUsage of component.childUsages) {
    const childTargets = new Map()

    for (const [childProp, parentProp] of childUsage.propMap.entries()) {
      if (callbackTargets.has(parentProp)) {
        childTargets.set(childProp, callbackTargets.get(parentProp))
      }
    }

    actions.push(
      ...collectComponentActions(
        routePath,
        childUsage.childName,
        components,
        childTargets,
        new Set(seen),
      ),
    )
  }

  return dedupeActions(actions)
}

function getActionNote(action, callbackTargets) {
  if (action.target) {
    return 'Static link'
  }

  const hasCallbackTarget = action.callbackNames?.some((name) =>
    callbackTargets.has(name),
  )

  if (hasCallbackTarget) {
    return `Calls \`${action.callbackName}\``
  }

  return action.fallback
}

function normalizeRouteAction(routePath, action) {
  if (action.label === 'Parent Chapter / Story Editor') {
    if (routePath === '/stories/$storyId/chapters/new') {
      return {
        ...action,
        destination: '/stories/$storyId/edit',
        label: 'Story Editor',
      }
    }

    if (routePath === '/stories/$storyId/chapters/$chapterId/children/new') {
      return {
        ...action,
        destination: '/stories/$storyId/chapters/$chapterId/edit',
        label: 'Parent Chapter',
      }
    }
  }

  return action
}

function getActionDestination(action, callbackTargets) {
  if (action.target) {
    return action.target
  }

  const destinations =
    action.callbackNames
      ?.map((callbackName) => callbackTargets.get(callbackName))
      .filter(Boolean) ?? []

  return [...new Set(destinations)].join(' or ') || undefined
}

function dedupeActions(actions) {
  const uniqueActions = new Map()

  for (const action of actions) {
    const key = [
      action.component,
      action.label,
      action.destination ?? '',
      action.note,
    ].join('|')

    uniqueActions.set(key, action)
  }

  return [...uniqueActions.values()]
}

function formatTable(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n')
}

function escapeMarkdown(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function formatDestination(action) {
  if (action.destination) {
    if (action.destination.includes(' or ')) {
      return action.destination
        .split(' or ')
        .map((destination) => `\`${destination}\``)
        .join(' or ')
    }

    return `\`${action.destination}\``
  }

  return action.note
}

function getPageTitle(routePath, componentName) {
  return ROUTE_TITLE_BY_PATH.get(routePath) ?? componentName ?? routePath
}

function compareRoutePaths(left, right) {
  if (left.routePath === right.routePath) {
    return 0
  }

  return left.routePath < right.routePath ? -1 : 1
}

async function generateNavigationDoc() {
  const { componentNames, components } = await getFeatureComponents()
  const routeFiles = await listFiles(ROUTES_DIR, '.tsx')
  const routes = []

  for (const file of routeFiles) {
    const sourceFile = await parseSourceFile(file)
    const routePaths = getRoutePaths(sourceFile)

    for (const routePath of routePaths) {
      routes.push({
        callbackTargets: getRouteCallbackTargets(sourceFile),
        componentName: getRouteComponentName(sourceFile, componentNames),
        file,
        routePath,
      })
    }
  }

  routes.sort(compareRoutePaths)

  const lines = [
    '# Navigation Flow',
    '',
    '<!-- Generated by `npm run docs:navigation`. Do not edit by hand. -->',
    '',
    'This document lists the current application URLs and the visible controls that can navigate or change page state. Static destinations are inferred from TanStack Router route adapters and JSX controls. Runtime-only behaviour is listed as notes because those labels or destinations depend on browser state or IndexedDB data.',
    '',
    '## URLs',
    '',
    formatTable(
      ['URL', 'Page', 'Route file'],
      routes.map((route) => [
        `\`${escapeMarkdown(route.routePath)}\``,
        escapeMarkdown(getPageTitle(route.routePath, route.componentName)),
        `\`${escapeMarkdown(path.relative(ROOT, route.file))}\``,
      ]),
    ),
    '',
    'Unknown paths render the configured not-found page, which links back to `/`.',
    '',
    '## Page Actions',
  ]

  for (const route of routes) {
    const pageTitle = getPageTitle(route.routePath, route.componentName)
    const actions =
      route.componentName ?
        collectComponentActions(
          route.routePath,
          route.componentName,
          components,
          route.callbackTargets,
        )
      : []

    lines.push('', `### ${pageTitle}`, '', `URL: \`${route.routePath}\``, '')

    if (actions.length > 0) {
      lines.push(
        formatTable(
          ['Control label', 'Component', 'Destination / behaviour'],
          actions.map((action) => [
            escapeMarkdown(action.label),
            `\`${escapeMarkdown(action.component)}\``,
            escapeMarkdown(formatDestination(action)),
          ]),
        ),
      )
    } else {
      lines.push('No visible page actions were detected.')
    }

    const runtimeNotes = RUNTIME_NOTES_BY_ROUTE.get(route.routePath)

    if (runtimeNotes) {
      lines.push('', 'Runtime notes:', '')
      lines.push(...runtimeNotes.map((note) => `- ${note}`))
    }
  }

  lines.push('', '### Not Found', '', 'URL: unknown paths', '')

  const notFoundActions = collectComponentActions(
    'unknown paths',
    'NotFoundPage',
    components,
    new Map(),
  )

  if (notFoundActions.length > 0) {
    lines.push(
      formatTable(
        ['Control label', 'Component', 'Destination / behaviour'],
        notFoundActions.map((action) => [
          escapeMarkdown(action.label),
          `\`${escapeMarkdown(action.component)}\``,
          escapeMarkdown(formatDestination(action)),
        ]),
      ),
    )
  } else {
    lines.push('No visible page actions were detected.')
  }

  lines.push(
    '',
    '## Static Analysis Limits',
    '',
    '- Data-driven controls, such as reader branch choices, use IndexedDB content for labels.',
    '- Some buttons perform mutations before navigation, so the final destination may be owned by a hook rather than the JSX element itself.',
    '- Conditional controls may only appear in loading, empty, missing-resource, mobile, or validation states.',
    '',
  )

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, lines.join('\n'), 'utf8')

  return OUTPUT_PATH
}

generateNavigationDoc()
  .then((outputPath) => {
    console.log(`Generated ${path.relative(ROOT, outputPath)}`)
  })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
