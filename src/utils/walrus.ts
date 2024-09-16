import { aggregatorUrl, publishUrl } from "../config";

export async function store(data: any, stringify = true): Promise<string> {
  const body = stringify ? JSON.stringify(data) : data;
  const response = await fetch(`${publishUrl}/v1/store?epochs=1`, {
    method: "PUT",
    body,
  });

  if (response.status === 200) {
    const res = await response.json();

    let blobId = "";
    if ("alreadyCertified" in res) {
      blobId = res.alreadyCertified.blobId;
    } else if ("newlyCreated" in res) {
      blobId = res.newlyCreated.blobObject.blobId;
    }
    return `${aggregatorUrl}/v1/${blobId}`;
  } else {
    throw new Error("Something went wrong when storing the blob!");
  }
}

export async function parseData(
  url: string
): Promise<{ content: string; images: string[] }> {
  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
}
