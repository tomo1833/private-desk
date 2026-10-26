import { google, blogger_v3 } from 'googleapis';

const blogger = google.blogger('v3');

export async function fetchAllPosts(
  blogId: string,
  apiKey: string,
): Promise<blogger_v3.Schema$Post[]> {
  const posts: blogger_v3.Schema$Post[] = [];
  let pageToken: string | undefined;
  do {
    const res = await blogger.posts.list({
      blogId,
      key: apiKey,
      fetchBodies: true,
      maxResults: 100,
      pageToken,
    });
    posts.push(...(res.data.items ?? []));
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);
  return posts;
}
