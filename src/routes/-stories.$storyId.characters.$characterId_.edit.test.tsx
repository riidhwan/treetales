import { describe, expect, it } from 'vitest'

import { routeTree } from '@/routeTree.gen'
import { Route } from '@/routes/stories.$storyId.characters.$characterId_.edit'

interface TestRoute {
  readonly children?: Record<string, TestRoute>
  readonly options: {
    readonly getParentRoute: () => TestRoute
    readonly id: string
  }
}

function getChildRoutes(route: TestRoute): TestRoute[] {
  return Object.values(route.children ?? {})
}

describe('character edit route', () => {
  it('registers a Character edit component', () => {
    expect(Route.options.component).toBeTypeOf('function')
  })

  it('keeps story and character loading inside the edit component', () => {
    expect(Route.options.loader).toBeUndefined()
  })

  it('registers as a sibling of Character detail so it can render full-page', () => {
    const rootRoute = routeTree as unknown as TestRoute
    const storyRoute = getChildRoutes(rootRoute).find(
      (route) => route.options.id === '/stories/$storyId',
    )
    const storyChildren = storyRoute ? getChildRoutes(storyRoute) : []
    const characterDetailRoute = storyChildren.find(
      (route) => route.options.id === '/characters/$characterId',
    )
    const characterEditRoute = storyChildren.find(
      (route) => route.options.id === '/characters/$characterId_/edit',
    )

    expect(characterEditRoute).toBeTruthy()
    expect(characterEditRoute?.options.getParentRoute()).toBe(storyRoute)
    expect(characterDetailRoute?.children ?? []).not.toContain(
      characterEditRoute,
    )
  })
})
