import { headers } from "next/headers";
import FileEditorTextarea from "./FileEditorTextarea";

interface FileEditorProps {
  path: string;
}

export default async function FileEditor({ path }: FileEditorProps) {
  const fileName = path.split("/").pop();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/v1/sites-available/${fileName}`);
  const content = await res.text();

  return (
    <div>
      <p>{path}</p>
      <FileEditorTextarea content={content} />
    </div>
  );
}