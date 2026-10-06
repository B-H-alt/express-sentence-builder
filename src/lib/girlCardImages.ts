const girlImageModules = import.meta.glob(
  "../assets/pecs/girl/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

export const girlCardImages = Object.fromEntries(
  Object.entries(girlImageModules).map(([path, imageUrl]) => {
    const filename = path.split("/").pop() ?? "";
    const cardId = filename.replace(/\.jpg$/i, "");
    return [cardId, imageUrl];
  })
) as Record<string, string>;
