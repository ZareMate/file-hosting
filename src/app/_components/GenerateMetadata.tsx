import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { id?: string };
}): Promise<Metadata> {
  const fileId = searchParams.id;

  if (!fileId) {
    return {
      title: "File Not Found",
      description: "The file you are looking for does not exist.",
    };
  }

  // Fetch file details for metadata
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PAGE_URL}/api/files/share?id=${encodeURIComponent(fileId)}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    return {
      title: "File Not Found",
      description: "The file you are looking for does not exist.",
    };
  }
  const fileDetails = await response.json();

  return {
    title: fileDetails.name,
    description: fileDetails.description || fileDetails.name,
    openGraph: {
      title: fileDetails.name,
      description: fileDetails.description || fileDetails.name,
      url: `${process.env.NEXT_PUBLIC_PAGE_URL}/share?id=${fileDetails.id}`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_PAGE_URL}/api/files/serv?id=${fileDetails.id}`,
          alt: `${fileDetails.name} preview`,
        },
      ],
    },
  };
}
