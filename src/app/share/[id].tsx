// pages/share/[id].tsx

import Head from "next/head";
import { GetServerSideProps } from "next";

interface FileDetails {
  name: string;
  size: number;
  owner: string;
  uploadDate: string;
  id: string;
  url: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query.id as string;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/share?id=${id}`);
  if (!res.ok) {
    return {
      notFound: true,
    };
  }

  const fileDetails: FileDetails = await res.json();

  return {
    props: {
      fileDetails,
    },
  };
};

export default function SharePage({ fileDetails }: { fileDetails: FileDetails }) {
  return (
    <>
      <Head>
        <title>{fileDetails.name}</title>
        <meta property="og:title" content={fileDetails.name} />
        <meta property="og:description" content={`File shared by ${fileDetails.owner}`} />
        <meta property="og:image" content={fileDetails.url} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_PAGE_URL}/share?id=${fileDetails.id}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="T3 File Share" />
      </Head>
      <main className="text-white flex flex-col items-center justify-center min-h-screen bg-black">
        <h1 className="text-3xl font-bold mb-4">File: {fileDetails.name}</h1>
        <p>Size: {(fileDetails.size / 1024).toFixed(2)} KB</p>
        <p>Uploaded by: {fileDetails.owner}</p>
      </main>
    </>
  );
}
