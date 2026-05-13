interface CreatedItem {
  readonly createdAt: number
  readonly id: string
}

export function sortByCreatedAt<TItem extends CreatedItem>(
  items: readonly TItem[],
): TItem[] {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.createdAt !== secondItem.createdAt) {
      return firstItem.createdAt - secondItem.createdAt
    }

    return firstItem.id.localeCompare(secondItem.id)
  })
}
