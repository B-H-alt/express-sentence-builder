const sharedImageModules = import.meta.glob(
  "../assets/pecs/shared/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

export const sharedCardImages = Object.fromEntries(
  Object.entries(sharedImageModules).map(([path, imageUrl]) => {
    const filename = path.split("/").pop() ?? "";
    const cardId = filename.replace(/\.jpg$/i, "");
    return [cardId, imageUrl];
  })
) as Record<string, string>;
