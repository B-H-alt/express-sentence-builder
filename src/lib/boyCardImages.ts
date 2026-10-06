const boyImageModules = import.meta.glob(
  "../assets/pecs/boy/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

export const boyCardImages = Object.fromEntries(
  Object.entries(boyImageModules).map(([path, imageUrl]) => {
    const filename = path.split("/").pop() ?? "";
    const cardId = filename.replace(/\.jpg$/i, "");
    return [cardId, imageUrl];
  })
) as Record<string, string>;
